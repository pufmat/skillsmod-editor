import { get, writable, type Writable } from "svelte/store";
import * as jdenticon from "jdenticon";

jdenticon.configure({
    lightness: {
        color: [0.4, 0.7],
        grayscale: [0.4, 0.7]
    },
    saturation: {
        color: 1.0,
        grayscale: 0.5
    },
	padding: 0.0,
	backColor: "#000"
});

export interface Position {
	x: number,
	y: number
}

export interface Definition {
	name: string,
	icon: string,
	data: string
}

export interface Skill {
	name: string,
	definition: Definition | null,
	pos: Position,
	root: boolean
}

export interface Connection {
	type: ConnectionType,
	direction: ConnectionDirection,
	skills: [Skill, Skill]
}

export enum ConnectionType {
	NORMAL = "normal",
	EXCLUSIVE = "exclusive"
}

export enum ConnectionDirection {
	UNIDIRECTIONAL = "unidirectional",
	BIDIRECTIONAL = "bidirectional"
}

export enum GridType {
	NONE,
	SQUARE,
	HEX_FLAT,
	HEX_POINTY,
}

export enum Button {
	LEFT = 0,
	MIDDLE = 1,
	RIGHT = 2
}

export interface Grid {
	type: GridType;
	spacing: number;
	size: number;
}

export interface Project {
	definitions: Map<string, Definition>;
	skills: Skill[];
	connections: Connection[];
}

export interface State {
	selectedDefinition: Definition | null;
	selectedConnectionType: ConnectionType;
	selectedConnectionDirection: ConnectionDirection;
}

export function saveProject(project: Project) {
	const definitionsJson = Array.from(project.definitions.values()).reduce((json, definition) => {
		json[definition.name] = {
			data: definition.data,
			icon: definition.icon
		};
		return json;
	}, {} as { [key: string]: unknown });
	const skillsJson = project.skills.reduce((json, skill) => {
		json[skill.name] = {
			definition: skill.definition?.name ?? null,
			x: skill.pos.x,
			y: skill.pos.y,
			root: skill.root
		};
		return json;
	}, {} as { [key: string]: unknown });
	const connectionsJson = project.connections.map(connection => {
		return {
			type: connection.type.toString(),
			direction: connection.direction.toString(),
			skills: connection.skills.map(skill => skill.name)
		}
	});

	localStorage.setItem("definitions", JSON.stringify(definitionsJson));
	localStorage.setItem("skills", JSON.stringify(skillsJson));
	localStorage.setItem("connections", JSON.stringify(connectionsJson));
}

export function loadProject(): Project {
	try {
		const definitionsJson: object = JSON.parse(localStorage.getItem("definitions") ?? "");
		const skillsJson: object = JSON.parse(localStorage.getItem("skills") ?? "");
		const connectionsJson: object = JSON.parse(localStorage.getItem("connections") ?? "");

		const definitions = new Map(Object.entries(definitionsJson).map(([name, {icon, data}]) => [
			name, {name, icon, data}
		]));

		const skillsMap = new Map<string, Skill>;

		const skills = Object.entries(skillsJson).map(([name, data]) => {
			const skill: Skill = {
				name,
				definition: definitions.get(data.definition) ?? null,
				pos: {
					x: data.x,
					y: data.y
				},
				root: data.root,
			};
			skillsMap.set(skill.name, skill);
			return skill;
		});

		const connections = Object.values(connectionsJson).map(connection => {
			if(Array.isArray(connection)){
				return {
					type: ConnectionType.NORMAL,
					direction: ConnectionDirection.BIDIRECTIONAL,
					skills: connection.map(id => skillsMap.get(id))
				};
			}else{
				return {
					type: connection.type as ConnectionType,
					direction: connection.direction as ConnectionDirection,
					skills: connection.skills.map((id: string) => skillsMap.get(id))
				};
			}
		}).flatMap(connection => {
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

		return {
			definitions,
			skills,
			connections
		};
	} catch (e){
		console.log(e);
		return {
			definitions: new Map(),
			skills: [],
			connections: []
		};
	}
}

export function randomIdentifier(): string {
	return Array.from(Array(16), () => Math.floor(Math.random() * 36).toString(36)).join("");
}

export async function readJson(file: File): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			if(typeof reader.result === "string"){
				resolve(JSON.parse(reader.result));
			}else{
				reject();
			}
		};
		reader.readAsText(file);
	});
}

export function saveJson(json: unknown, name: string){
	const a = document.createElement("a");
	a.download = name;
	a.href = URL.createObjectURL(new Blob([
		JSON.stringify(json, null, "\t")
	], {
		type: "application/json"
	}));
	a.click();
}

export function persistent<T>(save: (arg: T) => void, load: () => T): Writable<T> {
	const store = writable(load());

	return {
		subscribe: store.subscribe,
		set(newValue){
			save(newValue);
			store.set(newValue);
		},
		update(updater) {
			const newValue = updater(get(store));
			save(newValue);
			store.set(newValue);
		}
	};
 }