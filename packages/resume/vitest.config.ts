import path from "node:path";
import {
	defineWorkersConfig,
	defineWorkersProject,
	type WorkersProjectConfigExport,
	type WorkersUserConfigExport,
} from "@cloudflare/vitest-pool-workers/config";
import react from "@vitejs/plugin-react";

import { defineConfig, type ViteUserConfig } from "vitest/config";

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
	plugins: [react()],
	test: {
		name: "Resume",
		globals: true,
		reporters: "json",
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
		workspace: [
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

export default defineConfig(vitestConfig);
