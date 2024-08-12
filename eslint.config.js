import globals from "globals";
import js from "@eslint/js";
import ts from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import svelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import stylistic from "@stylistic/eslint-plugin";

export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs["flat/recommended"],
	{
		files: ["**/*.svelte"],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
			globals: globals.browser,
			parser: svelteParser,
			parserOptions: {
				parser: tsParser,
				extraFileExtensions: [".svelte"],
			},
		},
	},
	{
		ignores: ["dist/*"]
	},
	{
		plugins: {
			"@stylistic": stylistic,
		},
	},
	{
		rules: {
			"@stylistic/indent": ["error", "tab", { "SwitchCase": 0 }],
			eqeqeq: ["error", "always"],
		},
	},
];
