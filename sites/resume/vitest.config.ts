import {
	defineWorkersProject,
	type WorkersProjectConfigExport,
} from "@cloudflare/vitest-pool-workers/config";

import { defineProject, type ViteUserConfig } from "vitest/config";

const workerProjectConfig = {
	test: {
		name: "Worker",
		include: ["test/unit/**/*.spec.ts", "test/integration/**/*.spec.ts"],
		poolOptions: {
			workers: {
				wrangler: {
					configPath: "./wrangler.jsonc",
					environment: "integration",
				},
			},
		},
	},
} satisfies WorkersProjectConfigExport;

const workerProject = defineWorkersProject(workerProjectConfig);

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
