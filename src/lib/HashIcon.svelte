<script lang="ts">
	import * as jdenticon from "jdenticon";

	export let value;
	let svg;

	$: jdenticon.updateSvg(svg, value ?? "");
</script>

<svg bind:this={svg}></svg>

<style>
	svg {
		width: 100%;
		height: 100%;
	}
</style>