import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		name: "Unit",
		globals: true,
		include: ["test/**/*.spec.ts"],
	},
});
