import config from "#config";
import BaseGame from "#root/Game/index.ts";
import { Logger } from "#root/utils/Logger.ts";
import type { Page } from "playwright";
import type { Node } from "./Node.ts";
import { Graph } from "./Graph.ts";
import { exit } from "node:process";

const logger = Logger({
	logLevel: "debug",
});

// async function PlaceQueen(node: Node, page: Page) {
// 	logger.debug(
// 		`Placing queen on node ${node.id} at row ${node.row}, column ${node.column}`,
// 	);
// 	await page
// 		.locator(`div.queens-cell-with-border[data-cell-idx="${node.id}"]`)
// 		.click();
// 	await page.waitForTimeout(1000); // Wait for the animation to complete
// 	node.removed = true;
// }

/**
 * Queens Game
 *
 * This module handles the Queens game on LinkedIn.
 * It initializes the game, starts it, and provides a method to play the game.
 */
export const PlayQueens = async () => {
	using queens = await BaseGame({ url: config.Urls.Queens });
	await queens.start();

	await queens.playGame(async (page) => {
		/* Close the popup windows */
		await page.locator("button#launch-footer-start-button").click();
		await page.locator('button[aria-label="Dismiss"]').click();

		/* Get the number of rows */
		const rows = await page.locator("div#queens-grid").evaluate((el) => {
			return window.getComputedStyle(el).getPropertyValue("--rows");
		});

		const graph = new Graph(+rows, page);

		const nodes = await page.locator("div.queens-cell-with-border").all();
		await Promise.all(
			nodes.map(async (cell) => {
				const [cellIdx, cellColor, ariaLabel] = await Promise.all([
					cell.getAttribute("data-cell-idx"),
					cell.getAttribute("class"),
					cell.getAttribute("aria-label"),
				]);

				const idx = +(cellIdx ?? -1);
				const color = +(cellColor?.split("-").slice(-1)[0]?.trim() ?? -1);

				const [, colorName = ""] =
					ariaLabel?.match(/of color\s*([^,]+)/i) ?? [];

				if (idx === -1) {
					console.error("Invalid cell index found:", cellIdx);
					exit(1);
				}

				if (color === -1) {
					console.error("No color found for cell", cellIdx);
					exit(1);
				}
				graph.addNode(idx, color);
				graph.setColorName(color, colorName.trim());
			}),
		);

		graph.createEdges();
		const startingNode = graph.nodes.values().next().value;
		if (!startingNode) {
			throw new Error("No starting node found in the graph.");
		}

		await SearchGraph({ graph, page });
		graph.print();
		console.log(graph.queens);
		await page.pause();
	});
};

async function SearchGraph({ graph, page }: { graph: Graph; page: Page }) {
	let continueSearch = true;
	let nLoops = 0;
	const maxLoops = 100000;

	search: while (continueSearch) {
		if (nLoops > maxLoops) {
			return;
		}
		nLoops++;

		for (const node of graph.nodes.values()) {
			logger.debug(
				`Searching node ${node.id} at row ${node.row}, column ${node.column}, color ${node.color}`,
			);
			const edges = node.edges;

			/* Place queen if the node has no edges */
			if (edges.size === 0) {
				console.log("Placing queen on node with no edges:", node.id);
				await graph.placeQueen(node);
				continue search;
			}

			const sameRow: Set<Node> = new Set();
			const sameColumn: Set<Node> = new Set();
			const sameColor: Set<Node> = new Set();

			for (const edge of edges) {
				const edgeNode = graph.nodes.get(edge);
				if (!edgeNode) {
					logger.error(`Edge node ${edge} not found in graph.`);
					continue;
				}
				if (edgeNode.row === node.row) {
					sameRow.add(edgeNode);
				}
				if (edgeNode.column === node.column) {
					sameColumn.add(edgeNode);
				}
				if (edgeNode.color === node.color) {
					sameColor.add(edgeNode);
				}
			}

			// Place queen if the node is the last in its row, column, or color
			if (sameRow.size === 0 || sameColumn.size === 0 || sameColor.size === 0) {
				logger.debug(
					"Placing queen on node with no same row/column/color:",
					node.id,
				);
				await graph.placeQueen(node);
				continue search;
			}

			if (
				sameColumn.isSubsetOf(sameColor) &&
				sameColumn.size !== sameColor.size
			) {
				logger.debug("Filtering same color nodes in column:", node.id);
				await graph.filter(sameColor, (n) => n.column !== node.column);
				continue search;
			}

			if (sameRow.isSubsetOf(sameColor) && sameRow.size !== sameColor.size) {
				logger.debug("Filtering same color nodes in row:", node.id);
				await graph.filter(sameColor, (n) => n.row !== node.row);
				continue search;
			}
		}

		for (const [color, colorSet] of graph.colors.entries()) {
			logger.debug(`Searching color ${color} (${graph.colorNames.get(color)})`);

			let intersectionSet = new Set<number>(
				colorSet.values().next()?.value?.edges || [],
			);

			for (const node of colorSet) {
				intersectionSet = intersectionSet.intersection(node.edges);
			}

			if (intersectionSet.size > 0) {
				for (const nodeId of intersectionSet) {
					const node = graph.nodes.get(nodeId);
					if (!node) {
						logger.error(`Node ${nodeId} not found in graph.`);
						continue;
					}
					logger.debug(
						`Excluding node ${node.id} at row ${node.row}, column ${node.column} with color ${node.color}`,
					);
					await graph.excludeCell(node);
				}
				continue search;
			}
		}

		continueSearch = false;
	}
}

export default PlayQueens;
