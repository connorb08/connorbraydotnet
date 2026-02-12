import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		cloudflare({
			viteEnvironment: { name: "ssr" },
			// configPath: "./wrangler.json",
			// auxiliaryWorkers: [{ configPath: "../../services/database/wrangler.json" }],
		}),
		reactRouter(),
	],
	server: {
		host: "127.0.0.1",
	},
});
