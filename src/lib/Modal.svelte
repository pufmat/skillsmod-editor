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

<dialog bind:this={dialog}>
	<slot />
</dialog>

<style lang="scss">
	dialog {
		background-color: #ffffff;
		border-radius: 8px;
		padding: 0;
		border: 0;
	}
	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}
</style>