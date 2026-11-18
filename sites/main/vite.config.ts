import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { resolve } from "node:path";
import process from "node:process";
import { defineConfig } from "vite";
import { lazyPlugins } from "vite-plus";

const dev = process.env.NODE_ENV !== "production";

export default defineConfig({
	test: {
		// Vitest v4 compatibility: preserve mock call history.
		// Remove after tests no longer rely on calls from setup or earlier tests.
		// https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
		// https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
		clearMocks: false,
	},
	root: import.meta.dirname,
	plugins: lazyPlugins(() => [
		cloudflare({
			viteEnvironment: { name: "ssr" },
			// remoteBindings: true,
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
						{
							configPath: "../../services/db/wrangler.json",
						},
					]
				: [],
		}),
		reactRouter(),
	]),
	server: {
		host: "127.0.0.1",
		// hmr: {
		// 	host: "localhost",
		// 	protocol: "ws",
		// },
	},
	resolve: {
		// tsconfigPaths: true,
		alias: {
			"~/styles": resolve(import.meta.dirname, "styles"),
		},
	},
});
