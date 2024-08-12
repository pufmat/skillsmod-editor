<script lang="ts">
	let files: FileList | null;
	export let file: File | null = null;

	let formElement: HTMLFormElement;

	$: {
		if (files && files.length > 0) {
			file = files[0] ?? null;
			formElement.reset();
		} else {
			file = null;
		}
	}
</script>

<div class="file-input">
	<form bind:this={formElement}>
		<label>
			<input type="file" bind:files>
			{#if file === null}
				<div class="file-picker">Choose a file...</div>
			{:else}
				<div class="file-picker">{file.name}</div>
			{/if}
		</label>
	</form>
</div>

<style lang="scss">
	.file-input {
		flex: 1;
		color: inherit;
		background-color: var(--button-background-color);
		border: 1px solid var(--button-border-color);
		border-radius: 4px;
		min-width: 0;
	}
	.file-picker {
		font-size: 16px;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
	label {
		display: block;
		width: 100%;
		height: 100%;
		padding: 3px 6px;
		cursor: pointer;
	}
	input {
		display: none;
	}
</style>