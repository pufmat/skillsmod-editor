import { get, readable, writable, type Readable, type Writable } from "svelte/store";
import { PreferredTheme } from "./theme";

export interface Position {
	x: number,
	y: number
}

export interface Identifiable {
	id: string,
}

export interface Definition extends Identifiable {
	icon: string,
	data: string
}

export interface Skill extends Identifiable {
	definition: Definition,
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
	definitions: Definition[];
	skills: Skill[];
	connections: Connection[];
}

export interface Settings {
	theme: PreferredTheme;
	visibility: {
		normal: boolean;
		exclusive: boolean;
	};
}

export interface State {
	selectedDefinition: Definition | null;
	selectedConnectionType: ConnectionType;
	selectedConnectionDirection: ConnectionDirection;
}

export function groupById<T extends Identifiable>(array: T[]): Map<string, T> {
	return new Map(array.map(item => [item.id, item]));
}

export function randomIdentifier(): string {
	return Array.from(Array(16), () => Math.floor(Math.random() * 36).toString(36)).join("");
}

export function saveSettings(settings: Settings) {
	localStorage.setItem("settings", JSON.stringify(settings));
}

export function loadSettings(): Settings {
	try {
		const settingsJson = JSON.parse(localStorage.getItem("settings") ?? "");

		let theme = PreferredTheme.AUTOMATIC;
		switch(settingsJson.theme){
		case "light":
			theme = PreferredTheme.LIGHT;
			break;
		case "dark":
			theme = PreferredTheme.DARK;
			break;
		}

		return {
			theme,
			visibility: {
				normal: !!settingsJson.visibility.normal,
				exclusive: !!settingsJson.visibility.exclusive
			}
		};
	} catch {
		return {
			theme: PreferredTheme.AUTOMATIC,
			visibility: {
				normal: true,
				exclusive: true
			}
		}
	}
}

export function saveProject(project: Project) {
	const definitionsJson = Array.from(project.definitions.values()).reduce((json, definition) => {
		json[definition.id] = {
			data: definition.data,
			icon: definition.icon
		};
		return json;
	}, {} as Record<string, unknown>);
	const skillsJson = project.skills.reduce((json, skill) => {
		json[skill.id] = {
			definition: skill.definition.id,
			x: skill.pos.x,
			y: skill.pos.y,
			root: skill.root
		};
		return json;
	}, {} as Record<string, unknown>);
	const connectionsJson = project.connections.map(connection => {
		return {
			type: connection.type.toString(),
			direction: connection.direction.toString(),
			skills: connection.skills.map(skill => skill.id)
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

		const definitions = Object.entries(definitionsJson)
			.map(([id, {icon, data}]) => ({id, icon, data}));

		const definitionsMap = groupById(definitions);

		const skills = Object.entries(skillsJson).map(([id, data]) => {
			return {
				id,
				definition: definitionsMap.get(data.definition),
				pos: {
					x: data.x,
					y: data.y
				},
				root: data.root,
			};
		}).filter((skill): skill is Skill => {
			if(skill.definition === undefined){
				return false;
			}
			return true;
		});

		const skillsMap = groupById(skills);

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
		}).filter((connection): connection is Connection => {
			if(connection.skills.length !== 2){
				return false;
			}
			if(connection.skills[0] === undefined){
				return false;
			}
			if(connection.skills[1] === undefined){
				return false;
			}
			if(connection.skills[0] === connection.skills[1]){
				return false;
			}
			return true;
		});

		return {
			definitions,
			skills,
			connections
		};
	} catch (e){
		console.error(e);
		return {
			definitions: [],
			skills: [],
			connections: []
		};
	}
}

export async function readJson(file: File): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			try{
				resolve(JSON.parse(reader.result as string));
			}catch(error){
				reject(error);
			}
		};
		reader.onerror = () => reject(reader.error);
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

export function systemTheme(): Readable<PreferredTheme> {
	return readable<PreferredTheme>(PreferredTheme.AUTOMATIC, set => {
		if(window.matchMedia === undefined){
			return () => {};
		}

		const query = window.matchMedia("(prefers-color-scheme: dark)");

		const update = (dark: boolean) => set(dark ? PreferredTheme.DARK : PreferredTheme.LIGHT);
		const listener = (match: MediaQueryListEvent) => update(match.matches);

		update(query.matches);

		query.addEventListener("change", listener);

		return () => {
			query.removeEventListener("change", listener);
		}
	});
}