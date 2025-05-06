import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "Unit",
		include: ["test/**/*.spec.ts"],
		pool: "threads",
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src"],
		},
	},
});
