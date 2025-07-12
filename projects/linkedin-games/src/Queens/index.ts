import { logger } from "#utils/Logger";
import { Graph } from "./graph.ts";
import type { IPageController } from "./page-controller/types.ts";
import type { INode } from "./types.ts";

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
	const graph = new Graph();
	await pageController.start();
	await pageController.populateGraph(graph);
	await pageController.dispose();
	await SearchGraph();
	logger.debug("Nodes in graph:", graph.nodes.size);
	return graph.gameData;

	async function placeQueen(node: INode) {
		if (node.removed) {
			return;
		}
		logger.debug(
			`Placing queen on node ${node.id} at row ${node.row}, column ${node.column}, color ${node.color}`,
		);
		await graph.placeQueen(node);
	}

	async function placeCross(node: INode) {
		if (node.removed) {
			return;
		}
		logger.debug(
			`Excluding node ${node.id} at row ${node.row}, column ${node.column}, color ${node.color}`,
		);
		await graph.excludeCell(node);
	}

	async function SearchGraph() {
		logger.debug("Starting graph search...");

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
						await placeCross(node);
					}
					continue search;
				}
			}

			continueSearch = false;
		}
	}
};
export default PlayQueens;

// Check conditions:
// - If all cells in a row or column (or color) have a common edge, remove that edge
