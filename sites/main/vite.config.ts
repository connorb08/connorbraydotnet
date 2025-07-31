import { resolve } from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		cloudflare({
			viteEnvironment: { name: "ssr" },
			persistState: {
				path: "../../.wrangler/state",
			},
			auxiliaryWorkers: [
				{
					configPath: "../../services/content-manager/wrangler.json",
				},
				{
					configPath: "../../services/database/wrangler.json",
				},
				{
					configPath: "../../services/api/wrangler.json",
				},
				{
					configPath: "../../services/linkedin-games/queens/wrangler.json",
				},
			],
		}),
		reactRouter(),
		tsconfigPaths(),
	],
	server: {
		host: "127.0.0.1",
	},
	resolve: {
		alias: {
			"~/styles": resolve(__dirname, "src/styles"),
		},
	},
});
