<script lang="ts">
	let files: FileList | undefined;
	export let file: File | undefined = undefined;

	$: file = files && files.length >= 0 ? files[0] : undefined;
</script>

<div class="file-input">
	<label>
		<input type="file" bind:files on:input>
		{#if files && files.length >= 0}
			<div class="file-picker">{files[0].name}</div>
		{:else}
			<div class="file-picker">Choose a file...</div>
		{/if}
	</label>
</div>

<style lang="scss">
	.file-input {
		flex: 1;
		color: #000000;
		background-color: #eeeeee;
		border: 1px solid #888888;
		border-radius: 4px;
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