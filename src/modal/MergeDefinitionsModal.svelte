<script lang="ts">
	import Button from "../lib/Button.svelte";
	import HStack from "../lib/HStack.svelte";
	import Modal from "../lib/Modal.svelte";
	import Padding from "../lib/Padding.svelte";
	import Text from "../lib/Text.svelte";
	import VStack from "../lib/VStack.svelte";

	export let state: State | null;
	export let onConfirm: () => void;
</script>

<script lang="ts" context="module">
	import type * as editor from "../editor";

	export interface State {
		definition: editor.Definition;
		newId: string;
	}
</script>

<Modal visible={state !== null}>
	{#if state !== null}
		<Padding padding="16px">
			<VStack gap="16px">
				<Text>
					Definition with provided ID already exists.
					Continuing to edit will merge definitions with the same ID.
				</Text>
				<HStack gap="8px">
					<Button on:click={() => state = null}><Text>Cancel</Text></Button>
					<Button on:click={onConfirm}><Text>Continue</Text></Button>
				</HStack>
			</VStack>
		</Padding>
	{/if}
</Modal>