import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		reactRouter(),
		tsconfigPaths(),
	],
	server: {
		host: "127.0.0.1",
	},
	resolve: {
		alias: {
			"#styles/*": "./src/styles/*",
		},
	},
});
