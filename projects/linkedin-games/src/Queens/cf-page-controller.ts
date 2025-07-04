import {
	launch,
	type Browser,
	type BrowserContext,
	type BrowserWorker,
	type Page,
} from "@cloudflare/playwright";
import config from "#root/config.ts";
import type { IGraph, INode, IPageController } from "./types";
import { logger } from "#utils/Logger";

export async function PageController(
	browserWorker: BrowserWorker,
): Promise<IPageController> {
	// #region Setup

	const url = config.Urls.Queens;
	const browser: Browser = await launch(browserWorker);
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
	}

	async function placeCross(node: INode) {
		if (config.interactive && !node.removed) {
			await page
				.locator(`div.queens-cell-with-border[data-cell-idx="${node.id}"]`)
				.click();
		}
	}

	async function placeQueen(node: INode) {
		if (config.interactive && !node.removed) {
			const queenCell = page.locator(
				`div.queens-cell-with-border[data-cell-idx="${node.id}"]`,
			);
			while (!(await queenCell.getAttribute("aria-label"))?.includes("Queen")) {
				await queenCell.click();
			}
			// await page
			// 	.locator(`div.queens-cell-with-border[data-cell-idx="${node.id}"]`)
			// 	.click();
			// await page
			// 	.locator(`div.queens-cell-with-border[data-cell-idx="${node.id}"]`)
			// 	.click();
		}
		return;
	}

	async function placeQueenById(nodeId: number) {
		if (config.interactive) {
			const queenCell = page.locator(
				`div.queens-cell-with-border[data-cell-idx="${nodeId}"]`,
			);
			while (!(await queenCell.getAttribute("aria-label"))?.includes("Queen")) {
				await queenCell.click();
			}
			// await page
			// 	.locator(`div.queens-cell-with-border[data-cell-idx="${node.id}"]`)
			// 	.click();
			// await page
			// 	.locator(`div.queens-cell-with-border[data-cell-idx="${node.id}"]`)
			// 	.click();
		}
		return;
	}

	async function clickSquare(node: INode) {
		if (config.interactive && !node.removed) {
			try {
				await page
					.locator(`div.queens-cell-with-border[data-cell-idx="${node.id}"]`)
					.click({ timeout: 100 });
			} catch (error) {
				logger.warn(`Error clicking square for node ${node.id}:`, error);
			}
		}
		return;
	}

	async function clickSquareById(nodeId: number) {
		try {
			await page
				.locator(`div.queens-cell-with-border[data-cell-idx="${nodeId}"]`)
				.click({ timeout: 100 });
		} catch (error) {
			logger.warn(`Error clicking square for node ${nodeId}:`, error);
		}
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
		clickSquare,
		clickSquareById,
		placeQueenById,
		[Symbol.asyncDispose]: dispose,
	};

	// #endregion
}

export default PageController;
