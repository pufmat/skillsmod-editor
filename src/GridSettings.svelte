<script lang="ts">
	import * as editor from "./editor"
	import HStack from "./lib/HStack.svelte";
	import IntegerInput from "./lib/IntegerInput.svelte";
	import Select from "./lib/Select.svelte";
	import Spacer from "./lib/Spacer.svelte";
	import Text from "./lib/Text.svelte";

	export let gridType: editor.GridType;
	export let gridSize: number;
	export let gridCount: number;
</script>

<div class="container">
	<HStack>
		<Text>Type:</Text>
		<Spacer />
	</HStack>
	<Select bind:value={gridType}>
		<option value={editor.GridType.NONE}>None</option>
		<option value={editor.GridType.SQUARE}>Square</option>
		<option value={editor.GridType.HEX_FLAT}>Hex: Flat</option>
		<option value={editor.GridType.HEX_POINTY}>Hex: Pointy</option>
	</Select>
	<HStack>
		<Text>Size:</Text>
		<Spacer />
	</HStack>
	<IntegerInput bind:value={gridSize} disabled={gridType == editor.GridType.NONE} />
	<HStack>
		<Text>Count:</Text>
		<Spacer />
	</HStack>
	<IntegerInput bind:value={gridCount} disabled={gridType == editor.GridType.NONE} />
</div>


<style lang="scss">
	.container{
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 2px 8px;
	}
</style>