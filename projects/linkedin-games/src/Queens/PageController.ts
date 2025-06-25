import type { Page } from "playwright";
import type { Node } from "./Node.ts";
import config from "#config";

export async function PageController({
	page,
}: {
	page: Page;
}) {
	async function StartGame(): Promise<void> {
		/* Close the popup windows */
		await page.locator("button#launch-footer-start-button").click();
		await page.locator('button[aria-label="Dismiss"]').click();
	}

	async function GetRows(): Promise<number> {
		/* Get the number of rows */
		const rows = await page.locator("div#queens-grid").evaluate((el) => {
			return window.getComputedStyle(el).getPropertyValue("--rows");
		});
		return +rows;
	}

	async function PlaceCross(node: Node): Promise<void> {
		if (config.interactive) {
			await page
				.locator(`div.queens-cell-with-border[data-cell-idx="${node.id}"]`)
				.click();
		}
	}

	async function PlaceQueen(node: Node): Promise<void> {
		if (config.interactive) {
			await page
				.locator(`div.queens-cell-with-border[data-cell-idx="${node.id}"]`)
				.click();
		}
		return;
	}

	return { page, StartGame, GetRows, PlaceQueen, PlaceCross };
}

export default PageController;
