import {
	type Browser,
	type BrowserContext,
	chromium,
	type Page,
} from "playwright";
import config from "#config";
import type { Graph } from "../graph";
import type { IPageController } from "./types";

const ariaLabelRegex = /of color\s*([^,]+)/i;

async function PageController(): Promise<IPageController> {
	// #region Setup

	const url = config.Urls.Queens;
	let browser: Browser | null = null;
	let context: BrowserContext | null = null;
	let page: Page | null = null;

	// #endregion

	// #region Methods
	async function start(): Promise<void> {
		browser = await chromium.launch({
			channel: "chromium",
			headless: config.headless,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				"--disable-web-security",
				"--disable-features=VizDisplayCompositor",
				"--disable-background-timer-throttling",
				"--disable-backgrounding-occluded-windows",
				"--disable-renderer-backgrounding",
			],
		});
		context = await browser.newContext({
			userAgent:
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			viewport: { width: 1280, height: 720 },
			ignoreHTTPSErrors: true,
		});

		// Block unnecessary resources for faster loading
		await context.route(
			"**/*.{jpg,jpeg,png,gif,svg,css,woff,woff2,ttf}",
			(route) => route.abort(),
		);
		await context.route("**/google-analytics.com/**", (route) => route.abort());
		await context.route("**/googletagmanager.com/**", (route) => route.abort());
		await context.route("**/facebook.com/**", (route) => route.abort());

		page = await context.newPage();
		await page.goto(url, { waitUntil: "domcontentloaded" });
		await page.getByText("Start game").click();
	}

	async function constructGraph(graph: Graph): Promise<void> {
		if (!(browser && page)) {
			throw new Error("Page controller has not been started.");
		}

		const tableCells = await page.locator("div.queens-cell-with-border").all();
		graph.sideLength = Math.sqrt(tableCells.length);

		// Optimize by batching attribute requests for each cell
		const cellsInfo = await Promise.all(
			tableCells.map(async (cell) => {
				// Get all attributes in one batch to reduce DOM queries
				const [cellIdx, cellColor, ariaLabel, colorValue] = await Promise.all([
					cell.getAttribute("data-cell-idx"),
					cell.getAttribute("class"),
					cell.getAttribute("aria-label"),
					cell.evaluate((element) => {
						// @ts-expect-error window is not defined in this context
						return window.getComputedStyle(element).backgroundColor;
					}),
				]);

				return { cellIdx, cellColor, ariaLabel, colorValue };
			}),
		);

		// Process cells data synchronously to avoid async overhead
		for (const cellInfo of cellsInfo) {
			const { cellIdx, cellColor, ariaLabel, colorValue } = cellInfo;

			const cellId = +(cellIdx ?? -1);
			const colorId = +(cellColor?.split("-").slice(-1)[0]?.trim() ?? -1);

			const [, colorName = ""] = ariaLabel?.match(ariaLabelRegex) ?? [];

			if (cellId === -1) {
				console.error("Invalid cell index found:", cellIdx);
				throw new Error("Invalid cell index found");
			}

			if (colorId === -1) {
				console.error("No color found for cell", cellIdx);
				throw new Error("No color found for cell");
			}

			graph.addCell({
				id: cellId,
				rowId: Math.floor(cellId / graph.sideLength),
				columnId: cellId % graph.sideLength,
				colorInfo: {
					id: colorId,
					name: colorName.trim(),
					value: colorValue,
				},
			});
		}
	}

	// #endregion

	// #region Dispose

	function dispose() {
		(async () => await disposeAsync())();
	}

	async function disposeAsync(): Promise<void> {
		page = null;
		if (context) {
			await context.close();
			context = null;
		}
		if (browser) {
			await browser.close();
			browser = null;
		}
	}

	// #endregion

	// #region Return

	return {
		start,
		constructGraph,
		dispose: disposeAsync,
		[Symbol.dispose]: dispose,
		[Symbol.asyncDispose]: disposeAsync,
	};

	// #endregion
}

export { PageController };
