<script lang="ts">
	import * as jdenticon from "jdenticon";
    import { activeTheme } from "../theme";

	const theme = activeTheme();

	export let value: string;
	let svg: SVGElement;

	$: jdenticon.updateSvg(svg, value ?? "", $theme["jdenticon-config"]);
</script>

<svg bind:this={svg}></svg>

<style>
	svg {
		width: 100%;
		height: 100%;
	}
</style>