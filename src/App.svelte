<script lang="ts">
	import * as editor from "./editor";
	import Canvas from "./Canvas.svelte";
    import Sidebar from "./Sidebar.svelte";
    import { writable } from "svelte/store";
    import { setContext } from "svelte";

	setContext("grid", writable<editor.Grid>({
		type: editor.GridType.SQUARE,
		spacing: 32,
		size: 8
    }));

	setContext("project", writable<editor.Project>({
		definitions: new Map(),
		skills: [],
		connections: []
	}));

	setContext("state", writable<editor.State>({
		selected: null
	}));
</script>

<div class="container">
	<Sidebar />
	<Canvas />
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
		display: flex;
	}
	:global(html, body) {
		font-size: 0;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		cursor: default;
	}
	:global(html, body) {
		margin: 0;
		padding: 0;
		border: 0;
		border-spacing: 0;
	}
	:global(*){
		box-sizing: border-box;
		font-family: sans-serif;
	}
</style>