import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { resolve } from "node:path";
import process from "node:process";
import { defineConfig } from "vite";
import removeAttributesPlugin from "vite-plugin-react-remove-attributes";
import { lazyPlugins } from "vite-plus";

const ENV_NAME = process.env.NODE_ENV;
const IS_PRODUCTION = ENV_NAME === "production";
const IS_DEVELOPMENT = ENV_NAME === "development";

const removeAttributes =
	// oxlint-disable typescript/no-unsafe-type-assertion
	(
		removeAttributesPlugin as unknown as {
			default: typeof removeAttributesPlugin;
		}
	).default;

const viteConfig = defineConfig({
	test: {
		// Vitest v4 compatibility: preserve mock call history.
		// Remove after tests no longer rely on calls from setup or earlier tests.
		// https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
		// https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
		clearMocks: false,
	},
	root: import.meta.dirname,
	plugins: lazyPlugins(() => [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		reactRouter(),
		IS_PRODUCTION
			? removeAttributes({
					attributes: ["data-testid"],
				})
			: null,
	]),
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
			"~": resolve(import.meta.dirname, "app"),
		},
		tsconfigPaths: true,
	},
});

export default viteConfig;
