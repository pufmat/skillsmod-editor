<script lang="ts">
	import Button from "../lib/Button.svelte";
	import HStack from "../lib/HStack.svelte";
  import HashIcon from "../lib/HashIcon.svelte";
	import Modal from "../lib/Modal.svelte";
	import Padding from "../lib/Padding.svelte";
	import Spacer from "../lib/Spacer.svelte";
	import Text from "../lib/Text.svelte";
	import TextInput from "../lib/TextInput.svelte";
	import VStack from "../lib/VStack.svelte";

	export let state: State | null;
	export let onConfirm: () => void;
</script>

<script lang="ts" context="module">
	import * as editor from "../editor";

	export interface State {
		definition: editor.Definition;
		newId: string;
		newIcon: string;
	}
</script>

<Modal visible={state !== null}>
	{#if state !== null}
		<Padding padding="16px">
			<VStack gap="16px">
				<VStack gap="8px">
					<HStack gap="8px">
						<Text>New definition ID:</Text>
						<Spacer>
							<TextInput bind:value={state.newId} />
						</Spacer>
					</HStack>
					<HStack gap="8px">
						<Text>New definition icon:</Text>
						<Spacer>
							<Button on:click={() => {
								if (state !== null) {
									state.newIcon = editor.randomIdentifier()
								}
							}}>
								<HStack gap="8px">
									<div>
										<HashIcon bind:value={state.newIcon}/>
									</div>
									<Text>Change</Text>
								</HStack>
							</Button>
						</Spacer>
					</HStack>
				</VStack>
				<HStack gap="8px">
					<Button on:click={() => state = null}><Text>Cancel</Text></Button>
					<Button on:click={onConfirm}><Text>Save</Text></Button>
				</HStack>
			</VStack>
		</Padding>
	{/if}
</Modal>

<style lang="scss">
	div {
		width: 19px;
	}
</style>