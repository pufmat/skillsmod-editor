export interface Position {
	x: number,
	y: number
}

export interface Definition {
	name: string,
	color: string
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

export function randomColor(): string {
	const i = Math.floor(Math.random() * 1530);
	const j = i % 255;
	switch (Math.floor(i / 255)) {
	case 0:
		return "#ff" + j.toString(16).padStart(2, "0") + "00";
	case 1:
		return "#" + (255 - j).toString(16).padStart(2, "0") + "ff00";
	case 2:
		return "#00ff" + j.toString(16).padStart(2, "0");
	case 3:
		return "#00" + (255 - j).toString(16).padStart(2, "0") + "ff";
	case 4:
		return "#" + j.toString(16).padStart(2, "0") + "00ff";
	case 5:
		return "#ff00" + (255 - j).toString(16).padStart(2, "0");
	default:
		throw new Error();
	}
}

export function randomName(): string {
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