import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		cloudflare({
			viteEnvironment: { name: "ssr" },
			persistState: {
				path: "../../.wrangler/state",
			},
			auxiliaryWorkers: [
				{
					configPath: "../../projects/linkedin-games/wrangler.json",
				},
			],
		}),
	],
	server: {
		host: "127.0.0.1",
	},
});
