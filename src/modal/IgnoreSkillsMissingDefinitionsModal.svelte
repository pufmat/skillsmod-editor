<script lang="ts">
    import Button from "../lib/Button.svelte";
    import HStack from "../lib/HStack.svelte";
    import Modal from "../lib/Modal.svelte";
    import Padding from "../lib/Padding.svelte";
    import Spacer from "../lib/Spacer.svelte";
    import Text from "../lib/Text.svelte";
    import VStack from "../lib/VStack.svelte";

	export let state: State | null;
	export let onConfirm: () => void;
</script>

<script lang="ts" context="module">
    import type * as editor from "../editor";

	export interface State {
		missingDefinitionsIds: string[]
		newSkills: editor.Skill[];
	}
</script>

<Modal visible={state !== null}>
	{#if state !== null}
		<Padding padding="16px">
			<VStack gap="16px">
				<VStack>
					<Text>
						Following definitions are missing in the editor, but are required by some skills in the loaded skills file:
						<ul>
							{#each state.missingDefinitionsIds as id}
								<li>
									{id}
								</li>
							{/each}
						</ul>
						Continuing to load this skills file will ignore all skills which use these missing definitions.
					</Text>
				</VStack>
				<HStack gap="8px">
					<Spacer />
					<Button on:click={() => state = null}><Text>Cancel</Text></Button>
					<Button on:click={onConfirm}><Text>Continue</Text></Button>
				</HStack>
			</VStack>
		</Padding>
	{/if}
</Modal>