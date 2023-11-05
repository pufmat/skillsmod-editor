<script lang="ts">
	export let checked = false;
</script>

<div class="checkbox-input">
	<label>
		<input type="checkbox" {checked} on:click={() => checked = !checked} />
		<div class="checkbox-wrapper">
			<div class="checkbox">
				{#if checked}
					<div class="checked"></div>
				{/if}
			</div>
		</div>
	</label>
</div>

<style lang="scss">
	.checkbox-wrapper {
		width: 100%;
		height: 100%;
		position: relative;
	}
	.checkbox {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		margin: auto;
		max-width: 100%;
		max-height: 100%;
		border-radius: 2px;
		background-color: var(--input-background-color);
		border: 1px solid var(--input-border-color);
		aspect-ratio: 1/1;
		border-radius: 4px;
		padding: 4px;
	}
	.checked {
		width: 100%;
		height: 100%;
		background-color: var(--input-check-mark-color);
		border-radius: 50%;
	}
	label {
		display: block;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}
	input {
		display: none;
	}
</style>