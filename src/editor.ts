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

export type Connection = [Skill, Skill];

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
	selected: Definition | null;
}

export function randomIdentifier(): string {
	return Array.from(Array(16), () => Math.floor(Math.random() * 36).toString(36)).join("");
}

export async function readJson(file: File){
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

export function saveJson(json, name: string){
	const a = document.createElement("a");
	a.download = name;
	a.href = URL.createObjectURL(new Blob([
		JSON.stringify(json, null, "\t")
	], {
		type: "application/json"
	}));
	a.click();
}

export function persistent<T>(save: (T) => void, load: () => T): Writable<T> {
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