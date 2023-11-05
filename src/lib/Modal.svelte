<script lang="ts">
	export let visible = false;

	let dialog: HTMLDialogElement;

	$: {
		if(dialog !== undefined){
			if(visible){
				dialog.showModal();
			}else{
				dialog.close();
			}
		}
	}
</script>

<dialog bind:this={dialog} on:close={() => visible = false}>
	<div class="wrapper">
		<div class="container">
			<slot />
		</div>
	</div>
</dialog>

<style lang="scss">
	.wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 100%;
		min-height: 100%;
	}
	.container {
		background-color: var(--background-color);
		color: var(--text-color);
		border-radius: 8px;
	}
	dialog {
		background-color: transparent;
		width: 100%;
		height: 100%;
		max-width: 100%;
		max-height: 100%;
		padding: 16px;
		border: 0;
	}
	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}
</style>