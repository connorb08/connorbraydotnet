import { resolve } from "node:path";
import removeAttribute from "@castlenine/vite-remove-attribute";
import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const viteConfig = defineConfig({
	plugins: [
		IS_PRODUCTION
			? removeAttribute({
					extensions: ["tsx"],
					attributes: ["data-testid"],
				})
			: null,
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
