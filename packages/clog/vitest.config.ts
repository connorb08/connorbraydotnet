import { defineConfig } from "vitest/config";

const workspacePath = process.env.WORKSPACE_PATH ?? "";
const childPath = import.meta.dirname.replace(workspacePath ?? "", "");
const reportsDirectory = `${workspacePath}/.coverage${childPath}`;

export default defineConfig({
	test: {
		name: "clog",
		globals: true,
		reporters: ["default"],
		coverage: {
			reporter: ["json"],
			reportsDirectory: reportsDirectory,
		},
	},
});
