<script lang="ts">
	export let value = "";
	export let disabled = false;
</script>

<input type="text" title={value} bind:value on:input {disabled}>

<style lang="scss">
	input {
		flex: 1;
		width: 100%;
		color: inherit;
		background-color: var(--input-background-color);
		border: 1px solid var(--input-border-color);
		border-radius: 4px;
		padding: 3px 6px;
		font-size: 16px;
		outline: 0;
		text-overflow: ellipsis;
		cursor: text;

		&:disabled {
			background-color: var(--disabled-input-background-color);
			border-color: var(--disabled-input-border-color);
			cursor: default;
		}
	}
</style>