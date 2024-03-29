module.exports = {
	root: true,
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:svelte/recommended"
	],
	parser: "@typescript-eslint/parser",
	plugins: [
		"@typescript-eslint",
		"@stylistic/js"
	],
	parserOptions: {
		sourceType: "module",
		ecmaVersion: 2020,
		extraFileExtensions: [".svelte"]
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ["*.svelte"],
			parser: "svelte-eslint-parser",
			parserOptions: {
				parser: "@typescript-eslint/parser"
			}
		}
	],
	rules: {
		"@stylistic/js/indent": ["error", "tab"],
		"eqeqeq": ["error", "always"]
	}
};
