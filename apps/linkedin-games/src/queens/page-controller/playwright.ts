import {
	type Browser,
	type BrowserContext,
	chromium,
	type Page,
} from "playwright";
import config from "#config";
import type { IGraph } from "../data-structures/graph-new";
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
		});
		context = await browser.newContext({
			userAgent:
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			viewport: { width: 1280, height: 720 },
		});
		await context.route("**.jpg", (route) => route.abort());
		page = await context.newPage();
		await page.goto(url);
		await page.getByText("Start game").click();
	}

	async function constructGraph(graph: IGraph): Promise<void> {
		if (!(browser && page)) {
			throw new Error("Page controller has not been started.");
		}

		const tableCells = await page.locator("div.queens-cell-with-border").all();
		graph.sideLength = Math.sqrt(tableCells.length);
		await Promise.all(
			tableCells.map(async (cell) => {
				const [cellIdx, cellColor, ariaLabel] = await Promise.all([
					cell.getAttribute("data-cell-idx"),
					cell.getAttribute("class"),
					cell.getAttribute("aria-label"),
				]);

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
						hex: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random hex color for demonstration
					},
				});
			}),
		);
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
