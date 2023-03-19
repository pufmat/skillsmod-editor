<script lang="ts">
	import * as editor from "./editor";
	import Button from "./lib/Button.svelte";
	import FileInput from "./lib/FileInput.svelte";
	import HStack from "./lib/HStack.svelte";
	import VStack from "./lib/VStack.svelte";
	import Spacer from "./lib/Spacer.svelte";
	import Text from "./lib/Text.svelte";
	import Divider from "./lib/Divider.svelte";

	export let definitions: Map<string, editor.Definition>;
	export let skills: editor.Skill[];
	export let connections: editor.Connection[];

	let definitionsFile: File | undefined;
	let skillsFile: File | undefined;
	let connectionsFile: File | undefined;

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

		definitions = new Map(Object.keys(definitionsJson).map(name => [
			name,
			{
				name: name,
				color: editor.randomColor()
			}
		]));

		const skillsMap = new Map<string, editor.Skill>;

		skills = Object.entries(skillsJson).map(entry => {
			const skill ={
				definition: definitions.get(entry[1].definition),
				pos: {
					x: entry[1].x,
					y: entry[1].y
				},
				root: entry[1].root ?? false,
			};
			skillsMap.set(entry[0], skill);
			return skill;
		});

		connections = Object.values(connectionJson).map(connection => [
			skillsMap.get(connection[0]),
			skillsMap.get(connection[1])
		]);
	}

	function exportSkills(){
		editor.saveJson(skills.reduce((json, skill) => {
			json[skill.pos.x + "_" + skill.pos.y] = {
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
				return skill.pos.x + "_" + skill.pos.y;
			})
		}), "connections.json");
	}
</script>

<div class="container">
	<HStack>
		<Text>Definitions:</Text>
		<Spacer />
	</HStack>
	<VStack gap="2px">
		<FileInput bind:file={definitionsFile} />
	</VStack>
	<HStack>
		<Text>Skills:</Text>
		<Spacer />
	</HStack>
	<VStack gap="2px">
		<FileInput bind:file={skillsFile} />
	</VStack>
	<HStack>
		<Text>Connections:</Text>
		<Spacer />
	</HStack>
	<VStack gap="2px">
		<FileInput bind:file={connectionsFile}/>
	</VStack>
	<Spacer />
	<VStack gap="2px">
		<Button on:click={importAll}>Import</Button>
	</VStack>
</div>
<Divider />
<div class="container">
	<HStack>
		<Text>Skills:</Text>
		<Spacer />
	</HStack>
	<VStack gap="2px">
		<Button on:click={exportSkills}>Export</Button>
	</VStack>
	<HStack>
		<Text>Connections:</Text>
		<Spacer />
	</HStack>
	<VStack gap="2px">
		<Button on:click={exportConnections}>Export</Button>
	</VStack>
</div>


<style lang="scss">
	.container{
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 2px 8px;
	}
</style>