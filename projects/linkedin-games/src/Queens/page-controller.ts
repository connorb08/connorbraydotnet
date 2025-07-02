import {
	chromium,
	type Browser,
	type BrowserContext,
	type Page,
} from "playwright";
import config from "#root/config.ts";
import type { IGraph, IGraphNode, IPageController } from "./types";

export async function PageController(): Promise<IPageController> {
	// #region Setup

	const url = config.Urls.Queens;
	const browser: Browser = await chromium.launch({
		headless: config.headless,
	});
	const context: BrowserContext = await browser.newContext();
	await context.route("**.jpg", (route) => route.abort());
	const page: Page = await context.newPage();

	// #endregion

	// #region Methods

	async function startGame(): Promise<void> {
		await page.goto(url);
		/* Close the popup windows */
		await page.locator("button#launch-footer-start-button").click();
		await page.locator('button[aria-label="Dismiss"]').click();
	}

	async function getSideLength(): Promise<number> {
		/* Get the number of rows */
		const sideLength = await page.locator("div#queens-grid").evaluate((el) => {
			return window.getComputedStyle(el).getPropertyValue("--rows");
		});
		return +sideLength;
	}

	async function populateGraph(graph: IGraph): Promise<void> {
		const tableCells = await page.locator("div.queens-cell-with-border").all();
		const preExistingQueenLocations: number[] = [];
		await Promise.all(
			tableCells.map(async (cell) => {
				const [cellIdx, cellColor, ariaLabel] = await Promise.all([
					cell.getAttribute("data-cell-idx"),
					cell.getAttribute("class"),
					cell.getAttribute("aria-label"),
				]);

				const cellId = +(cellIdx ?? -1);
				const colorId = +(cellColor?.split("-").slice(-1)[0]?.trim() ?? -1);

				const [, colorName = ""] =
					ariaLabel?.match(/of color\s*([^,]+)/i) ?? [];

				if (ariaLabel?.toLowerCase().includes("queen")) {
					preExistingQueenLocations.push(cellId);
				}

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
			}),
		);

		graph.createEdges();

		// if (config.Queens.placePreExistingQueens) {
		// 	for (const nodeId of preExistingQueenLocations) {
		// 		const queenNode = await graph.placeQueen(nodeId);
		// 		for await (const edgeId of queenNode.edges) {
		// 			await placeCross(edgeId);
		// 		}
		// 	}
		// }
	}

	async function placeCross(node: IGraphNode) {
		if (config.interactive && !node.removed) {
			await page
				.locator(`div.queens-cell-with-border[data-cell-idx="${node.id}"]`)
				.click();
		}
	}

	async function placeQueen(node: IGraphNode) {
		if (config.interactive && !node.removed) {
			await page
				.locator(`div.queens-cell-with-border[data-cell-idx="${node.id}"]`)
				.click();
			await page
				.locator(`div.queens-cell-with-border[data-cell-idx="${node.id}"]`)
				.click();
		}
		return;
	}

	async function pause(): Promise<void> {
		await page.pause();
	}

	// #endregion

	// #region Dispose

	async function dispose(): Promise<void> {
		if (page) {
			await page.close();
		}
		if (browser) {
			await browser.close();
		}
	}

	// #endregion

	// #region Return

	return {
		startGame,
		getSideLength,
		populateGraph,
		placeCross,
		placeQueen,
		pause,
		[Symbol.asyncDispose]: dispose,
	};

	// #endregion
}

export default PageController;
