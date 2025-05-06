import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
	test: {
		name: "Worker Integration",
		include: ["test/**/*.spec.ts"],
		poolOptions: {
			workers: {
				wrangler: {
					configPath: "./wrangler.jsonc",
					environment: "integration",
				},
			},
		},
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["app"],
			// exclude: ["validate/validate.js"],
		},
	},
});
