import type { Theme } from "../theme";

const theme: Theme = {
	"disabled-input-background-color": "#ccc",
	"disabled-input-border-color": "#888",
	"input-background-color": "#fff",
	"input-border-color": "#888",
	"input-check-mark-color": "#888",

	"button-background-color": "#eee",
	"button-border-color": "#888",

	"keybinding-background-color": "#ccc",
	"keybinding-border-color": "#888",

	"sidebar-background-color": "#ddd",
	"sidebar-border-color": "#888",

	"separator-color": "#000",

	"text-color": "#000",
	"background-color": "#fff",

	"editor-selection-background-color": "rgba(0, 0, 255, 0.25)",
	"editor-selection-border-color": "#00f",
	"editor-grid-color": "#aaa",
	"editor-normal-connection-color": "#000",
	"editor-exclusive-connection-color": "#f00",

	"jdenticon-config": {
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
	}
};

export default theme;