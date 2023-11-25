<script lang="ts">
	import * as editor from "./editor";
	import HStack from "./lib/HStack.svelte";
	import Spacer from "./lib/Spacer.svelte";
	import Text from "./lib/Text.svelte";
	import type { Writable } from "svelte/store";
	import { getContext } from "svelte";
	import Select from "./lib/Select.svelte";
	import { PreferredTheme } from "./theme";

	let settings = getContext<Writable<editor.Settings>>("settings");

</script>

<div class="container">
	<HStack>
		<Text>Theme:</Text>
		<Spacer />
	</HStack>
	<Select bind:value={$settings.theme}>
		<option value={PreferredTheme.AUTOMATIC}>Automatic</option>
		<option value={PreferredTheme.LIGHT}>Light</option>
		<option value={PreferredTheme.DARK}>Dark</option>
	</Select>
</div>

<style lang="scss">
	.container{
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 2px 8px;
	}
</style>