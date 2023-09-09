<script lang="ts">
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";
	import * as editor from "./editor"
	import HStack from "./lib/HStack.svelte";
	import Select from "./lib/Select.svelte";
	import Spacer from "./lib/Spacer.svelte";
	import Text from "./lib/Text.svelte";

	let state = getContext<Writable<editor.State>>("state");
</script>

<div class="container">
	<HStack>
		<Text>Type:</Text>
		<Spacer />
	</HStack>
	<Select bind:value={$state.selectedConnectionType}>
		<option value={editor.ConnectionType.NORMAL}>Normal</option>
		<option value={editor.ConnectionType.EXCLUSIVE}>Exclusive</option>
	</Select>
	<HStack>
		<Text>Direction:</Text>
		<Spacer />
	</HStack>
	<Select bind:value={$state.selectedConnectionDirection}>
		<option value={editor.ConnectionDirection.BIDIRECTIONAL}>Bidirectional</option>
		<option value={editor.ConnectionDirection.UNIDIRECTIONAL}>Unidirectional</option>
	</Select>
</div>


<style lang="scss">
	.container{
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 2px 8px;
	}
</style>