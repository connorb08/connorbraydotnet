import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import { lazyPlugins } from "vite-plus";

export default defineConfig({
	plugins: lazyPlugins(() => [
		cloudflare({
			viteEnvironment: { name: "ssr" },
			persistState: {
				path: "../../.wrangler/state",
			},
			auxiliaryWorkers: [
				{
					configPath: "../alerts/wrangler.json",
				},
			],
		}),
	]),
	server: {
		host: "127.0.0.1",
	},
});
