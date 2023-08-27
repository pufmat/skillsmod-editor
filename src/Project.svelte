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
				color: data["metadata"]?.["color"] ?? editor.randomColor(),
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

		$project.connections = Object.values(connectionsJson).map(connection => [
			skillsMap.get(connection[0]),
			skillsMap.get(connection[1])
		]);
	}

	function exportDefinitions(){
		editor.saveJson(Array.from($project.definitions.values()).reduce((json, definition) => {
			json[definition.name] = Object.assign({}, definition.data, {
				"metadata": saveMetadata ? {
					color: definition.color
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
		editor.saveJson($project.connections.map(connection => {
			return [0, 1].map(skillIndex => {
				const skill = connection[skillIndex];
				return skill.name;
			})
		}), "connections.json");
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
	<Button on:click={importAll}>Import</Button>
</div>
<Divider />
<div class="action-container">
	<HStack>
		<Text>Definitions:</Text>
		<Spacer />
	</HStack>
	<Button on:click={exportDefinitions}>Export</Button>
	<HStack>
		<Text>Skills:</Text>
		<Spacer />
	</HStack>
	<Button on:click={exportSkills}>Export</Button>
	<HStack>
		<Text>Connections:</Text>
		<Spacer />
	</HStack>
	<Button on:click={exportConnections}>Export</Button>
</div>
<Divider />
<div class="option-container">
	<Text>Save metadata:</Text>
	<Spacer />
	<Checkbox bind:checked={saveMetadata} />
</div>


<style lang="scss">
	.action-container{
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 2px 8px;
	}
	.option-container{
		display: grid;
		grid-template-columns: auto 1fr 20px;
		grid-template-rows: 20px;
		gap: 2px;
	}
</style>