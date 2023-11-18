<script lang="ts">
    import Button from "../lib/Button.svelte";
    import Modal from "../lib/Modal.svelte";
    import Padding from "../lib/Padding.svelte";
    import Text from "../lib/Text.svelte";
    import VStack from "../lib/VStack.svelte";

	export let state: State | null;
</script>

<script lang="ts" context="module">
	export interface State {
		file: string
	}
</script>

<Modal visible={state !== null}>
	{#if state !== null}
		<Padding padding="16px">
			<VStack gap="16px">
				<VStack>
					<Text>
						File {state.file} could not be loaded because it is invalid or contain syntax errors.
					</Text>
				</VStack>
				<Button on:click={() => state = null}><Text>Ok</Text></Button>
			</VStack>
		</Padding>
	{/if}
</Modal>