import { defineConfig, type PlaywrightTestConfig } from "@playwright/test";

const config = {
	testDir: "./test/e2e",
	fullyParallel: true,
	reporter: [
		["list"],
		[
			"html",
			{
				outputFolder: "test/e2e-results",
				host: "127.0.0.1",
				port: 3001,
				open: "never",
			},
		],
	],
	outputDir: "test/e2e-results",
	webServer: {
		command: "bun run dev",
		url: "http://localhost:3000",
	},
	use: {
		baseURL: "http://localhost:3000/",
		viewport: { width: 1920, height: 1080 },
	},
} satisfies PlaywrightTestConfig;

export default defineConfig(config);
