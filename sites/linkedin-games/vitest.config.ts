import { defineWorkersProject } from "@cloudflare/vitest-pool-workers/config";
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

export default defineProject({
	test: {
		projects: [worker],
	},
});
