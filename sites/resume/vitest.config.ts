import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineProject, type ViteUserConfig } from "vitest/config";

const workerProject = defineProject({
	plugins: [
		cloudflareTest({
			wrangler: { configPath: "./wrangler.jsonc", environment: "integration" },
		}),
	],
	test: {
		globals: true,
		name: "Worker",
		include: ["test/unit/**/*.spec.ts", "test/integration/**/*.spec.ts"],
	},
});

const vitestConfig = {
	test: {
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
			workerProject,
		],
	},
} satisfies ViteUserConfig;

export default defineProject(vitestConfig);
