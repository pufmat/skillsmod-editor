<script lang="ts">
	import * as editor from "./editor";
	import Canvas from "./Canvas.svelte";
	import Sidebar from "./Sidebar.svelte";
	import { writable } from "svelte/store";
	import { setContext } from "svelte";
	import { FallbackTheme, applyTheme } from "./theme";

	setContext("grid", writable<editor.Grid>({
		type: editor.GridType.SQUARE,
		spacing: 32,
		size: 8,
		count: 6,
		group: 1
	}));

	setContext("project", editor.persistent<editor.Project>(editor.saveProject, editor.loadProject));

	setContext("state", writable<editor.State>({
		selectedDefinition: null,
		selectedConnectionType: editor.ConnectionType.NORMAL,
		selectedConnectionDirection: editor.ConnectionDirection.BIDIRECTIONAL
	}));

	const settings = editor.persistent<editor.Settings>(editor.saveSettings, editor.loadSettings);
	setContext("settings", settings);

	const systemTheme = editor.systemTheme();

	$: applyTheme($settings.theme, $systemTheme, FallbackTheme.LIGHT);
</script>

<div class="container">
	<Canvas />
	<Sidebar />
</div>

<style lang="scss">
	.container {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
	}
	:global(html, body) {
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		cursor: default;
		margin: 0;
		padding: 0;
		border: 0;
		border-spacing: 0;
		font-size: 0;
	}
	:global(body) {
		width: 100%;
		height: 100%;
		color: var(--text-color);
		background-color: var(--background-color);
	}
	:global(*){
		box-sizing: border-box;
		font-family: sans-serif;
	}
</style>