import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./test/e2e",
	fullyParallel: true,
	reporter: [
		["list"],
		[
			"html",
			{
				outputFolder: "test/reports/e2e",
				host: "127.0.0.1",
				port: 3001,
				open: "never",
			},
		],
	],
	outputDir: "test/reports/e2e",
	webServer: {
		command: "bun run dev",
		url: "http://localhost:3000",
	},
	use: {
		baseURL: "http://localhost:3000/",
		viewport: { width: 1920, height: 1080 },
	},
});
