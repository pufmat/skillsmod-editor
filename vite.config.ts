import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import legacy from "@vitejs/plugin-legacy"


// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte(),
		legacy({
			targets: ["defaults"]
		})
	],
	build: {
		rollupOptions: {
			output: {
				entryFileNames: "assets/[name].js",
				chunkFileNames: "assets/[name].js",
				assetFileNames: "assets/[name].[ext]"
			}
		}
	},
	base: ""
})
