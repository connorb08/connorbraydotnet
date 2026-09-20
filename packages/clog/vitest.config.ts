import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "clog",
		globals: true,
		reporters: ["default"],
	},
});
