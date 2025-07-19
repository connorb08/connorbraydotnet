import { resolve } from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import removeAttributesPlugin from "vite-plugin-react-remove-attributes";
import tsconfigPaths from "vite-tsconfig-paths";

const ENV_NAME = process.env.NODE_ENV;
const IS_PRODUCTION = ENV_NAME === "production";
const IS_DEVELOPMENT = ENV_NAME === "development";

const removeAttributes = (
	removeAttributesPlugin as unknown as {
		default: typeof removeAttributesPlugin;
	}
).default;

const viteConfig = defineConfig({
	plugins: [
		reactRouter(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tsconfigPaths(),
		IS_PRODUCTION
			? removeAttributes({
					attributes: ["data-testid"],
				})
			: null,
	],
	server: {
		host: "127.0.0.1",
		port: 3000,
		hmr: true,
	},
	build: {
		sourcemap: IS_DEVELOPMENT,
	},
	resolve: {
		alias: {
			"~": resolve(__dirname, "app"),
		},
	},
});

export default viteConfig;
