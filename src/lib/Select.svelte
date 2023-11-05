<script lang="ts">
	export let value: string | number;
</script>

<select bind:value>
	<slot />
</select>

<style lang="scss">
	select {
		flex: 1;
		color: inherit;
		background-color: var(--button-background-color);
		border: 1px solid var(--button-border-color);
		border-radius: 4px;
		padding: 3px 6px;
		font-size: 16px;
		cursor: pointer;
	}
</style>