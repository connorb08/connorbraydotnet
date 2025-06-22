import type { Page } from "playwright";
import type { Node } from "./Node.ts";
import config from "#config";

export async function PageController({
	page,
}: {
	page: Page;
}) {
	async function PlaceQueen(node: Node): Promise<void> {
		if (config.interactive) {
			await page
				.locator(`div.queens-cell-with-border[data-cell-idx="${node.id}"]`)
				.click();
		}
		return;
	}

	return { page, PlaceQueen };
}

export default PageController;
