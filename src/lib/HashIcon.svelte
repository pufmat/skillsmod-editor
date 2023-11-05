<script lang="ts">
	import * as jdenticon from "jdenticon";

	export let value: string;
	let svg: SVGElement;

	$: jdenticon.updateSvg(svg, value ?? "");
</script>

<svg bind:this={svg}></svg>

<style>
	svg {
		width: 100%;
		height: 100%;
	}
</style>