import { defineWorkersProject } from "@cloudflare/vitest-pool-workers/config";
import { defineConfig } from "vitest/config";

const WorkerProject = defineWorkersProject({
	test: {
		name: "Worker Integration",
		globals: true,
		include: ["test/worker/**/*.spec.ts"],
		poolOptions: {
			workers: {
				wrangler: {
					configPath: "./wrangler.jsonc",
					environment: "integration",
				},
			},
		},
	},
});

export default defineConfig({
	test: {
		globals: true,
		pool: "threads",
		coverage: {
			provider: "istanbul",
			reporter: ["text", "json", "html"],
			include: ["app", "validate"],
			exclude: ["validate/validate.js"],
		},
		workspace: [
			{
				extends: true,
				test: {
					name: "Unit",
					include: ["test/unit/**/*.spec.ts"],
				},
			},
			WorkerProject,
		],
	},
});
