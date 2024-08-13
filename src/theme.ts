import type { Readable } from "svelte/motion";
import { writable } from "svelte/store";
import lightTheme from "./theme/light";
import darkTheme from "./theme/dark";
import type { JdenticonConfig } from "jdenticon";

const globalTheme = writable(lightTheme);

export enum PreferredTheme {
	AUTOMATIC = "automatic",
	LIGHT = "light",
	DARK = "dark"
}

export enum FallbackTheme {
	LIGHT = "light",
	DARK = "dark"
}

export interface Theme {
	"disabled-input-background-color": string,
	"disabled-input-border-color": string,
	"input-background-color": string,
	"input-border-color": string,
	"input-check-mark-color": string,

	"button-background-color": string,
	"button-border-color": string,

	"keybinding-background-color": string,
	"keybinding-border-color": string,

	"sidebar-background-color": string,
	"sidebar-border-color": string,

	"separator-color": string,

	"text-color": string,
	"background-color": string,

	"editor-selection-background-color": string;
	"editor-selection-border-color": string;
	"editor-grid-color": string;
	"editor-root-border-color": string;
	"editor-root-color": string;
	"editor-normal-connection-color": string,
	"editor-exclusive-connection-color": string;

	"jdenticon-config": JdenticonConfig;
}

export function applyTheme(userTheme: PreferredTheme, systemTheme: PreferredTheme, fallbackTheme: FallbackTheme) {
	let theme;
	switch(userTheme){
	case PreferredTheme.LIGHT:
		theme = lightTheme;
		break;
	case PreferredTheme.DARK:
		theme = darkTheme;
		break;
	case PreferredTheme.AUTOMATIC:
		switch(systemTheme){
		case PreferredTheme.LIGHT:
			theme = lightTheme;
			break;
		case PreferredTheme.DARK:
			theme = darkTheme;
			break;
		case PreferredTheme.AUTOMATIC:
			switch(fallbackTheme){
			case FallbackTheme.LIGHT:
				theme = lightTheme;
				break;
			case FallbackTheme.DARK:
				theme = darkTheme;
				break;
			}
			break;
		}
		break;
	}

	globalTheme.set(theme);
	document.documentElement.style.cssText = Object.entries(theme).map(([key, value]) => `--${key}:${value}`).join(";")
}

export function activeTheme(): Readable<Theme> {
	return globalTheme;
}