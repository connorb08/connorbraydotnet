import {
	type Browser,
	type BrowserContext,
	type BrowserEndpoint,
	launch,
	type Page,
} from "@cloudflare/playwright";
import config from "#config";
import logger from "#logger";
import type { IGraph } from "../data-structures/graph";
import type { IPageController } from "./types";

const ariaLabelRegex = /of color\s*([^,]+)/i;

async function PageController(
	browserEndpoint: BrowserEndpoint,
): Promise<IPageController> {
	// #region Setup

	const url = config.Urls.Queens;
	let browser: Browser | null = null;
	let context: BrowserContext | null = null;
	let page: Page | null = null;

	// #endregion

	// #region Methods

	async function start(): Promise<void> {
		logger.debug("Launching browser...:");
		browser = await launch(browserEndpoint);
		logger.debug("Creating new browser context...:");
		context = await browser.newContext({
			userAgent:
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
			viewport: {
				width: 1280,
				height: 800,
			},
		});
		await context.route("**.jpg", (route) => route.abort());
		logger.debug("Creating new page...:");
		page = await context.newPage();
		logger.debug("Opening page...:");
		await page.goto(url);
		logger.debug("Clicking start button...:");
		await page.getByText("Start game").click();
	}

	async function populateGraph(graph: IGraph): Promise<void> {
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

				graph.colorInfo = {
					id: colorId,
					name: colorName.trim(),
					hex: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random hex color for demonstration
				};
				graph.addNode(cellId, colorId);
				logger.debug("Adding node", { cellId, colorId });
			}),
		);

		graph.createEdges();
	}

	// #endregion

	// #region Dispose

	function dispose() {
		(async () => await disposeAsync())();
	}

	async function disposeAsync(): Promise<void> {
		logger.debug("Disposing PageController resources...");
		page = null;
		if (browser) {
			logger.debug("Closing browser...");
			await browser.close();
			browser = null;
			logger.debug("Browser closed.");
		}
		logger.debug("Resources disposed.");
	}

	// #endregion

	// #region Return

	return {
		start,
		populateGraph,
		dispose: disposeAsync,
		[Symbol.dispose]: dispose,
		[Symbol.asyncDispose]: disposeAsync,
	};

	// #endregion
}

export { PageController };
