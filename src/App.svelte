<script lang="ts">
	import * as editor from "./editor";
	import Canvas from "./Canvas.svelte";
    import Sidebar from "./Sidebar.svelte";
    import { writable } from "svelte/store";
    import { setContext } from "svelte";

	function save(project: editor.Project) {
		const definitionsJson = Array.from(project.definitions.values()).reduce((json, definition) => {
			json[definition.name] = {
				data: definition.data,
				icon: definition.icon
			};
			return json;
		}, {});
		const skillsJson = project.skills.reduce((json, skill) => {
			json[skill.name] = {
				definition: skill.definition?.name ?? null,
				x: skill.pos.x,
				y: skill.pos.y,
				root: skill.root
			};
			return json;
		}, {});
		const connectionsJson = project.connections.map(connection => {
			return [0, 1].map(skillIndex => {
				const skill = connection[skillIndex];
				return skill.name;
			})
		});

		localStorage.setItem("definitions", JSON.stringify(definitionsJson));
		localStorage.setItem("skills", JSON.stringify(skillsJson));
		localStorage.setItem("connections", JSON.stringify(connectionsJson));
	}

	function load(): editor.Project {
		try {
			const definitionsJson: object = JSON.parse(localStorage.getItem("definitions"));
			const skillsJson: object = JSON.parse(localStorage.getItem("skills"));
			const connectionsJson: object = JSON.parse(localStorage.getItem("connections"));

			const definitions = new Map(Object.entries(definitionsJson).map(([name, {icon, data}]) => [
				name, {name, icon, data}
			]));

			const skillsMap = new Map<string, editor.Skill>;

			const skills = Object.entries(skillsJson).map(([name, data]) => {
				const skill: editor.Skill = {
					name,
					definition: data.definition ? definitions.get(data.definition) : null,
					pos: {
						x: data.x,
						y: data.y
					},
					root: data.root,
				};
				skillsMap.set(skill.name, skill);
				return skill;
			});

			const connections: editor.Connection[] = Object.values(connectionsJson).map(connection => [
				skillsMap.get(connection[0]),
				skillsMap.get(connection[1])
			]);

			return {
				definitions,
				skills,
				connections
			};
		} catch {
			return {
				definitions: new Map(),
				skills: [],
				connections: []
			};
		}
	}

	setContext("grid", writable<editor.Grid>({
		type: editor.GridType.SQUARE,
		spacing: 32,
		size: 8
    }));

	setContext("project", editor.persistent<editor.Project>(save, load));

	setContext("state", writable<editor.State>({
		selected: null
	}));
</script>

<div class="container">
	<Sidebar />
	<Canvas />
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
		display: flex;
	}
	:global(html, body) {
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		cursor: default;
		margin: 0;
		padding: 0;
		border: 0;
		border-spacing: 0;
		font-size: 0;
	}
	:global(*){
		box-sizing: border-box;
		font-family: sans-serif;
	}
</style>