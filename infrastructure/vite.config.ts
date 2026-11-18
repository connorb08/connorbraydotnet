import { defineConfig } from "vite-plus";

export default defineConfig({
	extends: "../vite.config.ts",
	plugins: [],
	lint: {
		rules: {
			"no-new": "allow",
		},
	},
});
