import { defineConfig } from "vitest/config";

export default defineConfig(() => ({
	root: import.meta.dirname,
	cacheDir: "../../node_modules/.vite/tools/workspace",
	test: {
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
	},
}));
