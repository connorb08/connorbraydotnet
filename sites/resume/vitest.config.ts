import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vite-plus";

export default defineConfig({
	test: {
		// Preserve Vitest v4 mock history and separate inline-project servers.
		clearMocks: false,
		sharedViteServer: false,
		name: "Resume",
		globals: true,
		exclude: ["test/e2e"],
		reporters: ["default", "json"],
		outputFile: {
			json: "./test/reports/results.json",
		},
		coverage: {
			provider: "istanbul",
			reporter: ["text", "json", "html"],
			include: ["app", "workers"],
			reportsDirectory: "./test/reports/coverage",
			exclude: ["app/entry.server.tsx"],
		},
		projects: [
			{
				extends: true,
				test: {
					name: "Unit",
					environment: "jsdom",
					include: ["app/**/*.spec.ts", "app/**/*.spec.tsx"],
					setupFiles: ["./test/setup.ts"],
				},
			},
			{
				// Worker tests must not inherit the root project's plugins or setup.
				extends: false,
				plugins: [
					cloudflareTest({
						wrangler: { configPath: "./wrangler.jsonc", environment: "integration" },
					}),
				],
				test: {
					clearMocks: false,
					globals: true,
					name: "Worker",
					include: ["test/unit/**/*.spec.ts", "test/integration/**/*.spec.ts"],
				},
			},
		],
	},
});
