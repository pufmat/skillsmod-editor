<script lang="ts">
	import * as editor from "./editor";
	import Button from "./lib/Button.svelte";
	import TextInput from "./lib/TextInput.svelte";
	import Radio from "./lib/Radio.svelte";
	import Modal from "./lib/Modal.svelte";
	import HStack from "./lib/HStack.svelte";
	import Spacer from "./lib/Spacer.svelte";
	import Text from "./lib/Text.svelte";
	import VStack from "./lib/VStack.svelte";
	import Padding from "./lib/Padding.svelte";
    import type { Writable } from "svelte/store";
    import { getContext } from "svelte";
    import HashIcon from "./lib/HashIcon.svelte";


	let project = getContext<Writable<editor.Project>>("project");
	let state = getContext<Writable<editor.State>>("state");

	let modalDefinition: editor.Definition;
	let modalVisible: boolean;
	let newName: string;

	function rename(){
		if(modalDefinition === null){
			return;
		}

		$project.definitions.delete(modalDefinition.name);
		const newDefinition = $project.definitions.get(newName);
		if(newDefinition === undefined){
			modalDefinition.name = newName;
			$project.definitions.set(newName, modalDefinition);
		}else{
			for(const skill of $project.skills){
				if(skill.definition === modalDefinition){
					skill.definition = newDefinition;
				}
			}
		}

		modalVisible = false;

		$project.definitions = $project.definitions;
	}

	function changeIcon(definition: editor.Definition){
		definition.icon = editor.randomIdentifier();
		$project.definitions = $project.definitions;
	}

	function openModal(definition: editor.Definition){
		newName = definition.name;
		modalDefinition = definition;
		modalVisible = true;
	}

	$: {
		if(Array.from($project.definitions.values()).find(definition => definition === $state.selectedDefinition) === undefined){
			$state.selectedDefinition = $project.definitions.values().next().value ?? null;
		}
	}
</script>

<div class="container">
	{#each Array.from($project.definitions.values()) as definition}
		<Radio on:click={() => $state.selectedDefinition = definition} checked={definition === $state.selectedDefinition} />
		<TextInput value={definition.name} disabled={true} />
		<Button on:click={() => changeIcon(definition)}>
			<HashIcon bind:value={definition.icon}/>
		</Button>
		<Button on:click={() => openModal(definition)}><Text>Edit</Text></Button>
	{/each}
</div>

<Modal visible={modalVisible}>
	<Padding padding="16px">
		<VStack gap="16px">
			<HStack gap="8px">
				<Text>New name:</Text>
				<Spacer>
					<TextInput bind:value={newName} />
				</Spacer>
			</HStack>
			<HStack gap="2px">
				<Button on:click={() => modalVisible = false}><Text>Cancel</Text></Button>
				<Button on:click={rename}><Text>Save</Text></Button>
			</HStack>
		</VStack>
	</Padding>
</Modal>

<style lang="scss">
	.container{
		display: grid;
		grid-template-columns: 27px 1fr 27px auto;
		gap: 2px;
	}
</style>