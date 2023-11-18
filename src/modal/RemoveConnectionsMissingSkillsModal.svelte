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
		missingSkillsIds: string[]
		newSkills: editor.Skill[];
	}
</script>

<Modal visible={state !== null}>
	{#if state !== null}
		<Padding padding="16px">
			<VStack gap="16px">
				<VStack>
					<Text>
						Following skills are missing in the loaded skills file, but are required by some connections in the editor:
						<ul>
							{#each state.missingSkillsIds as id}
								<li>
									{id}
								</li>
							{/each}
						</ul>
						Continuing to load this skills file will remove all connections which use these missing skills.
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