import type { Browser, BrowserContext, Page } from "playwright";
import { chromium } from "playwright";
import projectConfig from "#root/config.ts";

export interface GameConfig {
	url: string;
}

export const BaseGame = async (config: GameConfig) => {
	// #region Setup
	const url: string = config.url;
	const browser: Browser = await chromium.launch({
		headless: projectConfig.headless,
	});
	const context: BrowserContext = await browser.newContext();
	await context.route("**.jpg", (route) => route.abort());
	const page: Page = await context.newPage();
	// #endregion

	const start = async () => {
		await page.goto(url);
	};

	const playGame = async (action: (page: Page) => Promise<void>) => {
		await action(page);
	};

	const stop = async () => {
		if (page) {
			await page.close();
		}
		if (browser) {
			await browser.close();
		}
	};

	return {
		page,
		start,
		playGame,
		stop,
		[Symbol.dispose]: async () => {
			await stop();
		},
	};
};

export default BaseGame;
