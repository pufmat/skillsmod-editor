<script lang="ts">
	import Definitions from "./Definitions.svelte";
	import Grid from "./GridSettings.svelte";
	import Project from "./Project.svelte";
	import Text from "./lib/Text.svelte";
	import HStack from "./lib/HStack.svelte";
	import Spacer from "./lib/Spacer.svelte";
	import VStack from "./lib/VStack.svelte";
</script>

<div class="sidebar">
	<fieldset>
		<legend>Project</legend>
		<Project />
	</fieldset>
	<fieldset>
		<legend>Grid</legend>
		<Grid />
	</fieldset>
	<fieldset>
		<legend>Definitions</legend>
		<Definitions />
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