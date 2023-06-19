<script lang="ts">
	import type * as editor from "./editor";
	import Definitions from "./Definitions.svelte";
	import Grid from "./GridSettings.svelte";
	import Project from "./Project.svelte";
	import Text from "./lib/Text.svelte";
	import HStack from "./lib/HStack.svelte";
	import Spacer from "./lib/Spacer.svelte";
	import VStack from "./lib/VStack.svelte";

	export let gridType: editor.GridType;
	export let gridSize;
	export let gridCount;

	export let definitions: Map<string, editor.Definition>;
	export let skills: editor.Skill[];
	export let connections: editor.Connection[];

	export let selected: editor.Definition | null;
</script>

<div class="sidebar">
	<fieldset>
		<legend>Project</legend>
		<Project bind:definitions bind:skills bind:connections />
	</fieldset>
	<fieldset>
		<legend>Grid</legend>
		<Grid bind:gridSize bind:gridType bind:gridCount />
	</fieldset>
	<fieldset>
		<legend>Definitions</legend>
		<Definitions bind:definitions bind:skills bind:selected />
	</fieldset>
	<fieldset>
		<legend>Instructions</legend>
		<VStack>
			<HStack>
				<Text>Left Click - move view or drag skill.</Text>
				<Spacer />
			</HStack>
			<HStack>
				<Text>Middle Click - create or delete connection.</Text>
				<Spacer />
			</HStack>
			<HStack>
				<Text>Double Middle Click - toggle root skill.</Text>
				<Spacer />
			</HStack>
			<HStack>
				<Text>Right Click - create or edit or delete skill.</Text>
				<Spacer />
			</HStack>
			<HStack>
				<Text>Scroll - zoom view.</Text>
				<Spacer />
			</HStack>
		</VStack>
	</fieldset>
</div>

<style>
	.sidebar {
		flex-shrink: 0;
		background-color: #dddddd;
		width: 320px;
		height: 100%;
		padding: 4px;
		overflow: auto;
		border-right: 1px solid #888888;
	}
	fieldset{
		margin: 0;
		padding: 4px;
		border: 1px solid #000000;
		margin: 4px 0;
	}
	legend {
		font-size: 16px;
	}
</style>