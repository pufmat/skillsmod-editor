<script lang="ts">
	import * as editor from "./editor";
	import Button from "./lib/Button.svelte";
	import FileInput from "./lib/FileInput.svelte";
	import HStack from "./lib/HStack.svelte";
	import Spacer from "./lib/Spacer.svelte";
	import Text from "./lib/Text.svelte";
	import Divider from "./lib/Divider.svelte";
    import Checkbox from "./lib/Checkbox.svelte";

	export let definitions: Map<string, editor.Definition>;
	export let skills: editor.Skill[];
	export let connections: editor.Connection[];

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
		const connectionJson = await editor.readJson(connectionsFile);

		if(definitionsJson === undefined || typeof definitionsJson !== "object"){
			return;
		}
		if(skillsJson === undefined || typeof skillsJson !== "object"){
			return;
		}
		if(connectionJson === undefined || typeof connectionJson !== "object"){
			return;
		}

		definitions = new Map(Object.entries(definitionsJson).map(([name, data]) => [
			name,
			{
				name: name,
				color: data["editor-color"] ?? editor.randomColor(),
				data: data
			}
		]));

		const skillsMap = new Map<string, editor.Skill>;

		skills = Object.entries(skillsJson).map(entry => {
			const skill: editor.Skill = {
				name: entry[0],
				definition: definitions.get(entry[1].definition),
				pos: {
					x: entry[1].x,
					y: entry[1].y
				},
				root: entry[1].root ?? false,
			};
			skillsMap.set(skill.name, skill);
			return skill;
		});

		connections = Object.values(connectionJson).map(connection => [
			skillsMap.get(connection[0]),
			skillsMap.get(connection[1])
		]);
	}

	function exportDefinitions(){
		editor.saveJson(Array.from(definitions.values()).reduce((json, definition) => {
			json[definition.name] = Object.assign({}, definition.data, {
				"editor-color": saveMetadata ? definition.color : undefined
			});
			return json;
		}, {}), "definitions.json");
	}

	function exportSkills(){
		editor.saveJson(skills.reduce((json, skill) => {
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
		editor.saveJson(connections.map(connection => {
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