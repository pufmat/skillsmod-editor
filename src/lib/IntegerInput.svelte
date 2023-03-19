<script lang="ts">
	export let value: number;
	export let disabled = false;
</script>

<input type="number" bind:value on:input {disabled}>

<style lang="scss">
	input {
		flex: 1;
		width: 100%;
		color: #000000;
		background-color: #ffffff;
		border: 1px solid #888888;
		border-radius: 4px;
		padding: 3px 6px;
		font-size: 16px;
		outline: 0;
		text-overflow: ellipsis;
		cursor: text;
	}
	input:disabled {
		background-color: #cccccc;
		cursor: default;
	}
</style>