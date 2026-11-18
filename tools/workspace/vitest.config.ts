import { defineConfig } from "vite-plus";

export default defineConfig(() => ({
	root: import.meta.dirname,
	cacheDir: "../../node_modules/.vite/tools/workspace",
	test: {
		// Vitest v4 compatibility: preserve mock call history.
		// Remove after tests no longer rely on calls from setup or earlier tests.
		// https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
		// https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
		clearMocks: false,
		name: "@connorbraydotnet/workspace",
		watch: false,
		globals: true,
		environment: "jsdom",
		include: ["generators/**/*.spec.ts"],
		reporters: ["default"],
		coverage: {
			reportsDirectory: "./test-output/vitest/coverage",
			provider: "v8" as const,
		},
		deps: {
			optimizer: {
				client: { enabled: true },
				ssr: { enabled: true },
			},
		},
	},
}));
