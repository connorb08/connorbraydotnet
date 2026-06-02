import { resolve } from "node:path";
import process from "node:process";
import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

const dev = process.env.NODE_ENV !== "production";

export default defineConfig({
	plugins: [
		cloudflare({
			viteEnvironment: { name: "ssr" },
			persistState: {
				path: "../../.wrangler/state",
			},
			auxiliaryWorkers: dev
				? [
						{
							configPath: "../../services/content-manager/wrangler.json",
						},
						{
							configPath: "../../services/database/wrangler.json",
						},
					]
				: [],
		}),
		reactRouter(),
	],
	server: {
		host: "127.0.0.1",
	},
	resolve: {
		// tsconfigPaths: true,
		alias: {
			"~/styles": resolve(import.meta.dirname, "styles"),
		},
	},
});
