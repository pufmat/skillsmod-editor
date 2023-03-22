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

	export let definitions: Map<string, editor.Definition>;
	export let skills: editor.Skill[];

	export let selected: editor.Definition | null;

	let modalDefinition: editor.Definition;
	let modalVisible: boolean;
	let newName: string;

	function rename(){
		if(modalDefinition === null){
			return;
		}

		definitions.delete(modalDefinition.name);
		const newDefinition = definitions.get(newName);
		if(newDefinition === undefined){
			modalDefinition.name = newName;
			definitions.set(newName, modalDefinition);
		}else{
			for(const skill of skills){
				if(skill.definition === modalDefinition){
					skill.definition = newDefinition;
				}
			}
		}

		modalVisible = false;

		definitions = definitions;
	}

	function openModal(definition){
		newName = definition.name;
		modalDefinition = definition;
		modalVisible = true;
	}

	$: {
		if(Array.from(definitions.values()).find(definition => definition === selected) === undefined){
			selected = definitions.values().next().value;
		}
	}
</script>

<div class="container">
	{#each Array.from(definitions.values()) as definition}
		<Radio on:click={() => selected = definition} checked={definition === selected} />
		<TextInput value={definition.name} disabled={true} />
		<ColorInput bind:value={definition.color} on:input={() => definitions = definitions}/> <!-- TODO FIX -->
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