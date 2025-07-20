import { defineConfig } from "vitest/config.js";

export default defineConfig({
	test: {
		include: ["tests/**/*.spec.ts"],
		globals: true,
	},
});
