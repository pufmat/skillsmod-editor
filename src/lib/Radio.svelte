<script lang="ts">
	export let checked = false;
</script>

<div class="radio-input">
	<label>
		<input type="radio" {checked} on:click/>
		<div class="radio-wrapper">
			<div class="radio">
				{#if checked}
					<div class="checked"></div>
				{/if}
			</div>
		</div>
	</label>
</div>

<style>
	.radio-wrapper {
		width: 100%;
		height: 100%;
		position: relative;
	}
	.radio {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		margin: auto;
		max-width: 100%;
		max-height: 100%;
		border-radius: 2px;
		background-color: #ffffff;
		border: 1px solid #888888;
		aspect-ratio: 1/1;
		border-radius: 50%;
		padding: 4px;
	}
	.checked {
		width: 100%;
		height: 100%;
		background-color: #888888;
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