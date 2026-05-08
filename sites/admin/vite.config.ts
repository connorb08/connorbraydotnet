import process from "node:process";
import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

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
							configPath: "../../services/db/wrangler.json",
						},
					]
				: [],
		}),
		tailwindcss(),
		reactRouter(),
		tsconfigPaths(),
	],
	server: {
		host: "127.0.0.1",
	},
});
