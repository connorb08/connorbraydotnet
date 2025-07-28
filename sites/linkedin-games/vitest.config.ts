import { defineWorkersProject } from "@cloudflare/vitest-pool-workers/config";
import { defineConfig } from "vite";
import { defineProject } from "vitest/config";

const worker = defineWorkersProject({
	test: {
		name: "Queens Worker",
		include: ["worker/**/*.spec.ts"],
		globals: true,
		poolOptions: {
			workers: {
				wrangler: {
					configPath: "./wrangler.json",
				},
			},
		},
	},
});

const unit = defineProject({
	test: {
		name: "Queens Unit",
		include: ["src/**/*.spec.ts"],
		globals: true,
	},
});

export default defineConfig({
	test: {
		projects: [unit, worker],
	},
});
