<script lang="ts">
	import * as editor from "./editor";
	import Canvas from "./Canvas.svelte";
    import Sidebar from "./Sidebar.svelte";

	export let gridType: editor.GridType = editor.GridType.SQUARE;
	export let gridSize = 32;
	export let gridCount = 8;

	export let definitions = new Map<string, editor.Definition>();
	export let skills: editor.Skill[] = [];
	export let connections: editor.Connection[] = [];

	export let selected: editor.Definition | null = null;
</script>

<div class="container">
	<Sidebar bind:gridSize bind:gridType bind:gridCount bind:definitions bind:skills bind:connections bind:selected />
	<Canvas bind:gridSize bind:gridType bind:gridCount bind:definitions bind:skills bind:connections bind:selected />
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