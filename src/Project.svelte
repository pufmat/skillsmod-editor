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

	let project = getContext<Writable<editor.Project>>("project");

	let definitionsFile: File | undefined;
	let skillsFile: File | undefined;
	let connectionsFile: File | undefined;

	let saveMetadata = true;
	let legacyConnectionsFormat = false;

	async function importAll(){
		if(definitionsFile === undefined || skillsFile === undefined || connectionsFile === undefined){
			return;
		}

		const definitionsJson = await editor.readJson(definitionsFile);
		const skillsJson = await editor.readJson(skillsFile);
		const connectionsJson = await editor.readJson(connectionsFile);

		if(definitionsJson === undefined || typeof definitionsJson !== "object"){
			return;
		}
		if(skillsJson === undefined || typeof skillsJson !== "object"){
			return;
		}
		if(connectionsJson === undefined || typeof connectionsJson !== "object"){
			return;
		}

		$project.definitions = new Map(Object.entries(definitionsJson).map(([name, data]) => [
			name,
			{
				name,
				data,
				icon: data.metadata?.icon ?? editor.randomIdentifier(),
			}
		]));

		const skillsMap = new Map<string, editor.Skill>;

		$project.skills = Object.entries(skillsJson).map(([name, data]) => {
			const skill: editor.Skill = {
				name,
				definition: $project.definitions.get(data.definition),
				pos: {
					x: data.x,
					y: data.y
				},
				root: data.root ?? false,
			};
			skillsMap.set(skill.name, skill);
			return skill;
		});

		$project.connections = [];
		if (Array.isArray(connectionsJson)) {
			for(const skills of Object.values(connectionsJson)){
				$project.connections.push({
					type: editor.ConnectionType.NORMAL,
					direction: editor.ConnectionDirection.BIDIRECTIONAL,
					skills: skills.map(id => skillsMap.get(id))
				});
			}
		} else {
			for(const [type, group] of Object.entries(connectionsJson)){
				for(const [direction, pairs] of Object.entries(group as object)){
					for (const skills of pairs) {
						$project.connections.push({
							type: type as editor.ConnectionType,
							direction: direction as editor.ConnectionDirection,
							skills: skills.map(id => skillsMap.get(id))
						});
					}
				}
			}
			$project.connections = $project.connections.flatMap(connection => {
				if(connection.skills.length !== 2){
					return [];
				}
				if(connection.skills[0] === undefined){
					return [];
				}
				if(connection.skills[1] === undefined){
					return [];
				}
				if(connection.skills[0] === connection.skills[1]){
					return [];
				}
				return [connection];
			});
		}
	}

	function exportDefinitions(){
		editor.saveJson(Array.from($project.definitions.values()).reduce((json, definition) => {
			json[definition.name] = Object.assign({}, definition.data, {
				metadata: saveMetadata ? {
					icon: definition.icon
				} : undefined
			});
			return json;
		}, {}), "definitions.json");
	}

	function exportSkills(){
		editor.saveJson($project.skills.reduce((json, skill) => {
			json[skill.name] = {
				definition: skill.definition.name,
				x: skill.pos.x,
				y: skill.pos.y,
				root: skill.root
			};
			return json;
		}, {}), "skills.json");
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
				return [connection.skills.map(skill => skill.name)];
			}), "connections.json");
		}else{
			const connectionsJson = {};
			for(const connection of $project.connections){
				const groupJson = connectionsJson[connection.type] ??= {};
				const directionJson = groupJson[connection.direction] ??= [];
				directionJson.push(connection.skills.map(skill => skill.name));
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
	<HStack>
		<Text>Skills:</Text>
		<Spacer />
	</HStack>
	<FileInput bind:file={skillsFile} />
	<HStack>
		<Text>Connections:</Text>
		<Spacer />
	</HStack>
	<FileInput bind:file={connectionsFile}/>
	<Spacer />
	<Button on:click={importAll}><Text>Import</Text></Button>
</div>
<Divider />
<div class="action-container">
	<HStack>
		<Text>Definitions:</Text>
		<Spacer />
	</HStack>
	<Button on:click={exportDefinitions}><Text>Export</Text></Button>
	<HStack>
		<Text>Skills:</Text>
		<Spacer />
	</HStack>
	<Button on:click={exportSkills}><Text>Export</Text></Button>
	<HStack>
		<Text>Connections:</Text>
		<Spacer />
	</HStack>
	<Button on:click={exportConnections}><Text>Export</Text></Button>
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