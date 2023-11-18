<script lang="ts">
	import * as editor from "./editor";
	import Button from "./lib/Button.svelte";
	import TextInput from "./lib/TextInput.svelte";
	import Radio from "./lib/Radio.svelte";
	import Text from "./lib/Text.svelte";
    import type { Writable } from "svelte/store";
    import { getContext } from "svelte";
    import HashIcon from "./lib/HashIcon.svelte";
    import EditDefinitionModal from "./modal/EditDefinitionModal.svelte";
    import MergeDefinitionsModal from "./modal/MergeDefinitionsModal.svelte";
    import type { State as EditDefinitionModalState } from "./modal/EditDefinitionModal.svelte";
    import type { State as MergeDefinitionsModalState } from "./modal/MergeDefinitionsModal.svelte";


	let project = getContext<Writable<editor.Project>>("project");
	let state = getContext<Writable<editor.State>>("state");

	let editDefinitionModalState: EditDefinitionModalState | null = null;
	let mergeDefinitionsModalState: MergeDefinitionsModalState | null = null;

	function confirmEditDefinition(){
		if(editDefinitionModalState !== null){
			tryEditDefinition(
				editDefinitionModalState.definition,
				editDefinitionModalState.newId
			);
			editDefinitionModalState = null;
		}
	}

	function confirmMergeDefinitions(){
		if(mergeDefinitionsModalState !== null){
			tryMergeDefinitions(
				mergeDefinitionsModalState.definition,
				mergeDefinitionsModalState.newId
			);
			mergeDefinitionsModalState = null;
		}
	}

	function tryEditDefinition(definition: editor.Definition, newId: string){
		if(definition.id === newId){
			return;
		}

		if($project.definitions.some(definition => definition.id === newId)){
			mergeDefinitionsModalState = {
				definition: definition,
				newId: newId
			};
			return;
		}

		definition.id = newId;

		forceApplyDefinitions($project.definitions);
	}

	function tryMergeDefinitions(definition: editor.Definition, newId: string){
		const newDefinition = $project.definitions.find(definition => definition.id === newId);
		if(newDefinition === undefined){
			return;
		}

		$project.definitions.splice($project.definitions.indexOf(definition), 1);

		for(const skill of $project.skills){
			if(skill.definition === definition){
				skill.definition = newDefinition;
			}
		}

		forceApplyDefinitions($project.definitions);
	}

	function changeIcon(definition: editor.Definition){
		definition.icon = editor.randomIdentifier();
		forceApplyDefinitions($project.definitions);
	}

	function forceApplyDefinitions(newDefinitions: editor.Definition[]){
		$project.definitions = newDefinitions;
	}

	function editDefinition(definition: editor.Definition){
		editDefinitionModalState = {
			definition: definition,
			newId: definition.id
		};
	}

	$: {
		if($project.definitions.find(definition => definition === $state.selectedDefinition) === undefined){
			$state.selectedDefinition = $project.definitions[0] ?? null;
		}
	}
</script>

<div class="container">
	{#each $project.definitions as definition}
		<Radio on:click={() => $state.selectedDefinition = definition} checked={definition === $state.selectedDefinition} />
		<TextInput value={definition.id} disabled={true} />
		<Button on:click={() => changeIcon(definition)}>
			<HashIcon bind:value={definition.icon}/>
		</Button>
		<Button on:click={() => editDefinition(definition)}><Text>Edit</Text></Button>
	{/each}
</div>

<EditDefinitionModal bind:state={editDefinitionModalState} onConfirm={confirmEditDefinition} />
<MergeDefinitionsModal bind:state={mergeDefinitionsModalState} onConfirm={confirmMergeDefinitions} />

<style lang="scss">
	.container{
		display: grid;
		grid-template-columns: 27px 1fr 27px auto;
		gap: 2px;
	}
</style>