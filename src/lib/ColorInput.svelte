<script lang="ts">
	export let value: string;
</script>

<div class="color-input">
	<label>
		<input type="color" bind:value on:input />
		<div class="color-picker" style="background-color: {value}"></div>
	</label>
</div>

<style lang="scss">
	.color-input {
		flex: 1;
		color: #000000;
		background-color: #eeeeee;
		border: 1px solid #888888;
		border-radius: 4px;
	}
	.color-picker {
		width: 100%;
		height: 100%;
		border-radius: 2px;
	}
	label {
		display: block;
		width: 100%;
		height: 100%;
		padding: 4px;
		cursor: pointer;
	}
	input {
		display: none;
	}
</style>