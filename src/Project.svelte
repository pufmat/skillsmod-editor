<script lang="ts">
	import * as editor from "./editor";
	import Button from "./lib/Button.svelte";
	import FileInput from "./lib/FileInput.svelte";
	import HStack from "./lib/HStack.svelte";
	import Spacer from "./lib/Spacer.svelte";
	import Text from "./lib/Text.svelte";
	import Divider from "./lib/Divider.svelte";
    import Checkbox from "./lib/Checkbox.svelte";
    import type { Writable } from "svelte/store";
    import { getContext } from "svelte";
    import CannotLoadFileModal from "./modal/CannotLoadFileModal.svelte";
    import type { State as InvalidFileModalState } from "./modal/CannotLoadFileModal.svelte";
    import RemoveSkillsMissingDefinitionsModal from "./modal/RemoveSkillsMissingDefinitionsModal.svelte";
    import RemoveConnectionsMissingSkillsModal from "./modal/RemoveConnectionsMissingSkillsModal.svelte";
    import IgnoreSkillsMissingDefinitionsModal from "./modal/IgnoreSkillsMissingDefinitionsModal.svelte";
    import IgnoreConnectionsMissingSkillsModal from "./modal/IgnoreConnectionsMissingSkillsModal.svelte";
    import type { State as RemoveSkillsMissingDefinitionsModalState } from "./modal/RemoveSkillsMissingDefinitionsModal.svelte";
    import type { State as RemoveConnectionsMissingSkillsModalState } from "./modal/RemoveConnectionsMissingSkillsModal.svelte";
    import type { State as IgnoreSkillsMissingDefinitionsModalState } from "./modal/IgnoreSkillsMissingDefinitionsModal.svelte";
    import type { State as IgnoreConnectionsMissingSkillsModalState } from "./modal/IgnoreConnectionsMissingSkillsModal.svelte";

	let project = getContext<Writable<editor.Project>>("project");

	let definitionsFile: File | null = null;
	let skillsFile: File | null = null;
	let connectionsFile: File | null = null;

	let saveMetadata = true;
	let legacyConnectionsFormat = false;

	let cannotLoadFileModalState: InvalidFileModalState | null = null;

	let removeSkillsMissingDefinitionsModalState: RemoveSkillsMissingDefinitionsModalState | null = null;
	let removeConnectionsMissingSkillsModalState: RemoveConnectionsMissingSkillsModalState | null = null;
	let ignoreSkillsMissingDefinitionsModalState: IgnoreSkillsMissingDefinitionsModalState | null = null;
	let ignoreConnectionsMissingSkillsModalState: IgnoreConnectionsMissingSkillsModalState | null = null;

	function confirmRemoveSkillsMissingDefinitionsModal(){
		if(removeSkillsMissingDefinitionsModalState !== null){
			forceApplyDefinitions(removeSkillsMissingDefinitionsModalState.newDefinitions);
			removeSkillsMissingDefinitionsModalState = null;
		}
	}

	function confirmRemoveConnectionsMissingSkillsModal(){
		if(removeConnectionsMissingSkillsModalState !== null){
			forceApplySkills(removeConnectionsMissingSkillsModalState.newSkills);
			removeConnectionsMissingSkillsModalState = null;
		}
	}

	function confirmIgnoreSkillsMissingDefinitionsModal(){
		if(ignoreSkillsMissingDefinitionsModalState !== null){
			tryApplySkills(ignoreSkillsMissingDefinitionsModalState.newSkills);
			ignoreSkillsMissingDefinitionsModalState = null;
		}
	}

	function confirmIgnoreConnectionsMissingSkillsModal(){
		if(ignoreConnectionsMissingSkillsModalState !== null){
			tryApplyConnections(ignoreConnectionsMissingSkillsModalState.newConnections);
			ignoreConnectionsMissingSkillsModalState = null;
		}
	}

	function tryApplyDefinitions(newDefinitions: editor.Definition[]){
		const definitionsMap = editor.groupById(newDefinitions);

		const missingDefinitionsIds = Array.from(new Set(
			$project.skills
				.map(skill => skill.definition.id)
				.filter(definitionId => !definitionsMap.has(definitionId))
		));

		if(missingDefinitionsIds.length !== 0){
			removeSkillsMissingDefinitionsModalState = {
				missingDefinitionsIds,
				newDefinitions
			};
			return;
		}

		forceApplyDefinitions(newDefinitions);
	}

	function tryApplySkills(newSkills: editor.Skill[]){
		const skillsMap = editor.groupById(newSkills);

		const missingSkillsIds = Array.from(new Set(
			$project.connections
				.flatMap(connection => connection.skills)
				.map(skill => skill.id)
				.filter(skillId => !skillsMap.has(skillId))
		));

		if(missingSkillsIds.length !== 0){
			removeConnectionsMissingSkillsModalState = {
				missingSkillsIds,
				newSkills
			};
			return;
		}

		forceApplySkills(newSkills);
	}

	function tryApplyConnections(newConnections: editor.Connection[]){
		const skillsMap = editor.groupById($project.skills);

		const missingSkillsIds = Array.from(new Set(
			newConnections
				.flatMap(connection => connection.skills)
				.map(skill => skill.id)
				.filter(skillId => !skillsMap.has(skillId))
		));

		if(missingSkillsIds.length !== 0){
			newConnections = newConnections.filter(
				connection => connection.skills.every(
					skill => skillsMap.has(skill.id)
				)
			);

			ignoreConnectionsMissingSkillsModalState = {
				missingSkillsIds,
				newConnections
			};
			return;
		}

		forceApplyConnections(newConnections);
	}

	function forceApplyDefinitions(newDefinitions: editor.Definition[]){
		$project.definitions = newDefinitions;

		const definitionsMap = editor.groupById($project.definitions);

		const newSkills = $project.skills.filter(skill => {
			const newDefinition = definitionsMap.get(skill.definition.id);
			if(newDefinition === undefined){
				return false;
			}
			skill.definition = newDefinition;
			return true;
		});

		forceApplySkills(newSkills);
	}

	function forceApplySkills(newSkills: editor.Skill[]){
		$project.skills = newSkills;

		const skillsMap = editor.groupById($project.skills);

		const newConnections = $project.connections.filter(connection => {
			const newSkill0 = skillsMap.get(connection.skills[0].id);
			const newSkill1 = skillsMap.get(connection.skills[1].id);
			if(newSkill0 === undefined || newSkill1 === undefined){
				return false;
			}
			connection.skills[0] = newSkill0;
			connection.skills[1] = newSkill1;
			return true;
		});

		forceApplyConnections(newConnections);
	}

	function forceApplyConnections(newConnections: editor.Connection[]){
		$project.connections = newConnections;
	}

	async function importDefinitions(){
		if(definitionsFile === null){
			return;
		}

		const definitionsJson = await editor.readJson(definitionsFile).catch(() => Promise.resolve(null));

		if(definitionsJson === null || typeof definitionsJson !== "object"){
			cannotLoadFileModalState = {
				file: "definitions.json"
			};
			return;
		}

		const newDefinitions = Object.entries(definitionsJson as object).map(([id, data]) => ({
			id,
			data,
			icon: data.metadata?.icon ?? editor.randomIdentifier(),
		}));

		tryApplyDefinitions(newDefinitions);
	}

	async function importSkills(){
		if(skillsFile === null){
			return;
		}

		const skillsJson = await editor.readJson(skillsFile).catch(() => Promise.resolve(null));

		if(skillsJson === null || typeof skillsJson !== "object"){
			cannotLoadFileModalState = {
				file: "skills.json"
			};
			return;
		}

		const partialSkills = Object.entries(skillsJson as object).map(([id, data]) => {
			return {
				id,
				definitionId: data.definition,
				pos: {
					x: data.x,
					y: data.y
				},
				root: data.root ?? false,
			};
		});

		const definitionsMap = editor.groupById($project.definitions);

		const newSkills = new Array<editor.Skill>();
		const missingDefinitionsIds = new Set<string>();

		for (const partialSkill of partialSkills) {
			const definition = definitionsMap.get(partialSkill.definitionId);
			if(definition === undefined){
				missingDefinitionsIds.add(partialSkill.definitionId);
			}else{
				newSkills.push({
					definition,
					id: partialSkill.id,
					pos: partialSkill.pos,
					root: partialSkill.root,
				});
			}
		}

		if(missingDefinitionsIds.size !== 0){
			ignoreSkillsMissingDefinitionsModalState = {
				missingDefinitionsIds: Array.from(missingDefinitionsIds),
				newSkills
			};
			return;
		}


		tryApplySkills(newSkills);
	}

	async function importConnections(){
		if(connectionsFile === null){
			return;
		}

		const connectionsJson = await editor.readJson(connectionsFile).catch(() => Promise.resolve(null));

		if(connectionsJson === null || typeof connectionsJson !== "object"){
			cannotLoadFileModalState = {
				file: "connections.json"
			};
			return;
		}

		const partialConnections = new Array<{
			type: editor.ConnectionType,
			direction: editor.ConnectionDirection,
			skills: string[]
		}>();

		if (Array.isArray(connectionsJson)) {
			for(const skills of Object.values(connectionsJson)){
				partialConnections.push({
					type: editor.ConnectionType.NORMAL,
					direction: editor.ConnectionDirection.BIDIRECTIONAL,
					skills
				});
			}
		} else {
			for(const [type, group] of Object.entries(connectionsJson as object)){
				for(const [direction, pairs] of Object.entries(group as object)){
					for (const skills of pairs) {
						partialConnections.push({
							type: type as editor.ConnectionType,
							direction: direction as editor.ConnectionDirection,
							skills
						});
					}
				}
			}
		}

		const skillsMap = editor.groupById($project.skills);

		const newConnections = new Array<editor.Connection>();
		const missingSkillsIds = new Set<string>();

		for (const partialConnection of partialConnections) {
			if(partialConnection.skills.length !== 2){
				continue;
			}
			if(partialConnection.skills[0] === undefined){
				continue;
			}
			if(partialConnection.skills[1] === undefined){
				continue;
			}
			if(partialConnection.skills[0] === partialConnection.skills[1]){
				continue;
			}

			const skill0 = skillsMap.get(partialConnection.skills[0]);
			const skill1 = skillsMap.get(partialConnection.skills[1]);

			if(skill0 === undefined){
				missingSkillsIds.add(partialConnection.skills[0]);
			}
			if(skill1 === undefined){
				missingSkillsIds.add(partialConnection.skills[1]);
			}

			if(skill0 !== undefined && skill1 !== undefined){
				newConnections.push({
					skills: [skill0, skill1],
					type: partialConnection.type,
					direction: partialConnection.direction,
				});
			}
		}

		if(missingSkillsIds.size !== 0){
			ignoreConnectionsMissingSkillsModalState = {
				missingSkillsIds: Array.from(missingSkillsIds),
				newConnections
			};
			return;
		}


		tryApplyConnections(newConnections);
	}

	function exportDefinitions(){
		editor.saveJson(Array.from($project.definitions.values()).reduce((json, definition) => {
			json[definition.id] = Object.assign({}, definition.data, {
				metadata: saveMetadata ? {
					icon: definition.icon
				} : undefined
			});
			return json;
		}, {} as Record<string, unknown>), "definitions.json");
	}

	function exportSkills(){
		editor.saveJson($project.skills.reduce((json, skill) => {
			json[skill.id] = {
				definition: skill.definition.id,
				x: skill.pos.x,
				y: skill.pos.y,
				root: skill.root
			};
			return json;
		}, {} as Record<string, unknown>), "skills.json");
	}

	function exportConnections(){
		if(legacyConnectionsFormat){
			editor.saveJson($project.connections.flatMap(connection => {
				if(connection.type !== editor.ConnectionType.NORMAL){
					return [];
				}
				if(connection.direction !== editor.ConnectionDirection.BIDIRECTIONAL){
					return [];
				}
				return [connection.skills.map(skill => skill.id)];
			}), "connections.json");
		}else{
			const connectionsJson: Record<string, Record<string, string[][]>> = {};
			for(const connection of $project.connections){
				const groupJson = connectionsJson[connection.type] ??= {};
				const directionJson = groupJson[connection.direction] ??= [];
				directionJson.push(connection.skills.map(skill => skill.id));
			}
			editor.saveJson(connectionsJson, "connections.json");
		}
	}
</script>

<div class="action-container">
	<HStack>
		<Text>Definitions:</Text>
		<Spacer />
	</HStack>
	<FileInput bind:file={definitionsFile} />
	<Spacer />
	<HStack gap="2px">
		<Button on:click={importDefinitions}><Text>Import</Text></Button>
		<Button on:click={exportDefinitions}><Text>Export</Text></Button>
	</HStack>
	<HStack>
		<Text>Skills:</Text>
		<Spacer />
	</HStack>
	<FileInput bind:file={skillsFile} />
	<Spacer />
	<HStack gap="2px">
		<Button on:click={importSkills}><Text>Import</Text></Button>
		<Button on:click={exportSkills}><Text>Export</Text></Button>
	</HStack>
	<HStack>
		<Text>Connections:</Text>
		<Spacer />
	</HStack>
	<FileInput bind:file={connectionsFile} />
	<Spacer />
	<HStack gap="2px">
		<Button on:click={importConnections}><Text>Import</Text></Button>
		<Button on:click={exportConnections}><Text>Export</Text></Button>
	</HStack>
</div>
<Divider />
<div class="option-container">
	<HStack>
		<Text>Save metadata:</Text>
		<Spacer />
	</HStack>
	<Checkbox bind:checked={saveMetadata} />
	<HStack>
		<Text>Save connections in legacy format:</Text>
		<Spacer />
	</HStack>
	<Checkbox bind:checked={legacyConnectionsFormat} />
</div>

<CannotLoadFileModal bind:state={cannotLoadFileModalState} />
<RemoveSkillsMissingDefinitionsModal bind:state={removeSkillsMissingDefinitionsModalState} onConfirm={confirmRemoveSkillsMissingDefinitionsModal}/>
<RemoveConnectionsMissingSkillsModal bind:state={removeConnectionsMissingSkillsModalState} onConfirm={confirmRemoveConnectionsMissingSkillsModal}/>
<IgnoreSkillsMissingDefinitionsModal bind:state={ignoreSkillsMissingDefinitionsModalState} onConfirm={confirmIgnoreSkillsMissingDefinitionsModal}/>
<IgnoreConnectionsMissingSkillsModal bind:state={ignoreConnectionsMissingSkillsModalState} onConfirm={confirmIgnoreConnectionsMissingSkillsModal}/>

<style lang="scss">
	.action-container{
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 2px 8px;
	}
	.option-container{
		display: grid;
		grid-template-columns: auto 20px;
		grid-template-rows: 20px;
		gap: 2px;
	}
</style>