<script lang="ts">
	import type * as editor from "./editor";
	import Button from "./lib/Button.svelte";
	import ColorInput from "./lib/ColorInput.svelte";
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

	function openModal(definition){
		newName = definition.name;
		modalDefinition = definition;
		modalVisible = true;
	}

	$: {
		if(Array.from($project.definitions.values()).find(definition => definition === $state.selected) === undefined){
			$state.selected = $project.definitions.values().next().value ?? null;
		}
	}
</script>

<div class="container">
	{#each Array.from($project.definitions.values()) as definition}
		<Radio on:click={() => $state.selected = definition} checked={definition === $state.selected} />
		<TextInput value={definition.name} disabled={true} />
		<ColorInput bind:value={definition.color} on:input={() => $project.definitions = $project.definitions}/> <!-- TODO FIX -->
		<Button on:click={() => openModal(definition)}>Edit</Button>
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
				<Button on:click={() => modalVisible = false}>Cancel</Button>
				<Button on:click={rename}>Save</Button>
			</HStack>
		</VStack>
	</Padding>
</Modal>

<style lang="scss">
	.container{
		display: grid;
		grid-template-columns: 32px 1fr 32px auto;
		gap: 2px;
	}
</style>