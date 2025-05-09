import { resolve } from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const viteConfig = defineConfig({
	plugins: [
		reactRouter(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tsconfigPaths(),
	],
	server: {
		host: "127.0.0.1",
		port: 3000,
		hmr: true,
	},
	build: {
		sourcemap: process.env.NODE_ENV === "development",
	},
	resolve: {
		alias: {
			"~": resolve(__dirname, "app"),
		},
	},
});

export default viteConfig;
