<script lang="ts">
	export let gap = "0";
</script>

<div style="gap: {gap}">
	<slot />
</div>

<style lang="scss">
	div {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		overflow: hidden;
	}
</style>