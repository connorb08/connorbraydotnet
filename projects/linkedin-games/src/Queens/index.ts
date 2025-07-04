import { logger } from "#utils/Logger";
import { Graph } from "./graph.ts";
import type { INode, IPageController } from "./types.ts";

interface PlayQueensConfig {
	pageController: IPageController;
}

/**
 * Queens Game
 *
 * This module handles the Queens game on LinkedIn.
 * It initializes the game, starts it, and provides a method to play the game.
 */
export const PlayQueens = async ({ pageController }: PlayQueensConfig) => {
	await pageController.startGame();
	const sideLength = await pageController.getSideLength();
	const graph = new Graph(sideLength);
	await pageController.populateGraph(graph);

	return playGame();

	async function playGame() {
		await SearchGraph();
		for await (const node of graph.queens) {
			await pageController.placeQueenById(node);
		}
		return graph.queens;
		// await pageController.pause();
	}

	async function placeQueen(node: INode) {
		if (node.removed) {
			logger.warn(`Node ${node.id} is already removed, skipping placement.`);
			return;
		}
		// use a callback here?
		// await pageController.clickSquare(node);
		await graph.placeQueen(node, async (placedNode) => {
			// await pageController.clickSquare(placedNode);
		});
	}

	async function SearchGraph() {
		let continueSearch = true;
		let nLoops = 0;
		const maxLoops = 100000;

		search: while (continueSearch) {
			if (-nLoops > maxLoops) {
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
					placeQueen(node);
					break search;
				}

				const sameRow: Set<INode> = new Set();
				const sameColumn: Set<INode> = new Set();
				const sameColor: Set<INode> = new Set();

				for (const edge of edges.values()) {
					if (edge.row === node.row) {
						sameRow.add(edge);
					}
					if (edge.column === node.column) {
						sameColumn.add(edge);
					}
					if (edge.color === node.color) {
						sameColor.add(edge);
					}
				}

				// Place queen if the node is the last in its row, column, or color
				if (
					sameRow.size === 0 ||
					sameColumn.size === 0 ||
					sameColor.size === 0
				) {
					logger.debug(
						"Placing queen on node with no same row/column/color:",
						node.id,
					);
					await placeQueen(node);
					// await graph.placeQueen(node, async (placedNode) => {
					// 	await pageController.clickSquare(placedNode);
					// });

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

			for (const [colorId, colorSet] of graph.colors.entries()) {
				logger.debug(
					`Searching color ${colorId} (${graph.colorInfo[colorId]?.name}: ${graph.colorInfo[colorId]?.hex})`,
				);

				let intersectionSet = new Set<number>(
					colorSet.values().next()?.value?.edges.keys() || [],
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
						// await pageController.placeCross(node);
						await graph.excludeCell(node);
					}
					continue search;
				}
			}

			continueSearch = false;
		}
	}
};
export default PlayQueens;
