<script lang="ts">
	import * as editor from "./editor";
	import Button from "./lib/Button.svelte";
	import Radio from "./lib/Radio.svelte";
	import Text from "./lib/Text.svelte";
	import type { Writable } from "svelte/store";
	import { getContext } from "svelte";
	import HashIcon from "./lib/HashIcon.svelte";
	import EditDefinitionModal from "./modal/EditDefinitionModal.svelte";
	import MergeDefinitionsModal from "./modal/MergeDefinitionsModal.svelte";
	import type { State as EditDefinitionModalState } from "./modal/EditDefinitionModal.svelte";
	import type { State as MergeDefinitionsModalState } from "./modal/MergeDefinitionsModal.svelte";
	import Spacer from "./lib/Spacer.svelte";
	import HStack from "./lib/HStack.svelte";


	let project = getContext<Writable<editor.Project>>("project");
	let state = getContext<Writable<editor.State>>("state");

	let editDefinitionModalState: EditDefinitionModalState | null = null;
	let mergeDefinitionsModalState: MergeDefinitionsModalState | null = null;

	function confirmEditDefinition(){
		if(editDefinitionModalState !== null){
			tryEditDefinition(
				editDefinitionModalState.definition,
				editDefinitionModalState.newId,
				editDefinitionModalState.newIcon
			);
			editDefinitionModalState = null;
		}
	}

	function confirmMergeDefinitions(){
		if(mergeDefinitionsModalState !== null){
			tryMergeDefinitions(
				mergeDefinitionsModalState.definition,
				mergeDefinitionsModalState.newId,
				mergeDefinitionsModalState.newIcon
			);
			mergeDefinitionsModalState = null;
		}
	}

	function tryEditDefinition(definition: editor.Definition, newId: string, newIcon: string){
		definition.icon = newIcon;

		if(definition.id === newId){
			return;
		}

		if($project.definitions.some(definition => definition.id === newId)){
			mergeDefinitionsModalState = {
				definition,
				newId,
				newIcon
			};
			return;
		}

		definition.id = newId;

		forceApplyDefinitions($project.definitions);
	}

	function tryMergeDefinitions(definition: editor.Definition, newId: string, newIcon: string){
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

		newDefinition.icon = newIcon;

		forceApplyDefinitions($project.definitions);
	}

	function forceApplyDefinitions(newDefinitions: editor.Definition[]){
		$project.definitions = newDefinitions;
	}

	function editDefinition(definition: editor.Definition){
		editDefinitionModalState = {
			definition,
			newId: definition.id,
			newIcon: definition.icon
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
		<Button on:click={() => $state.selectedDefinition = definition}>
			<HStack>
				<Text>{definition.id}</Text>
				<Spacer />
			</HStack>
		</Button>
		<Button on:click={() => $state.selectedDefinition = definition}>
			<Text>{$project.skills.filter(s => s.definition === definition).length.toString()}</Text>
		</Button>
		<Button on:click={() => $state.selectedDefinition = definition}>
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
		grid-template-columns: 27px 1fr min-content 27px min-content;
		gap: 2px;
	}
</style>