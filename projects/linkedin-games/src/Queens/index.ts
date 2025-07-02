import { logger } from "#utils/Logger";
import { Graph } from "./graph.ts";
import type { IGraphNode, IPageController } from "./types.ts";

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

	await SearchGraph({
		graph,
		pageController,
	});

	console.log("queens placed:", graph.queens);

	await pageController.pause();
};

async function SearchGraph({
	graph,
	pageController,
}: {
	graph: Graph;
	pageController: IPageController;
}) {
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
				await pageController.placeQueen(node);
				await graph.placeQueen(node);
				continue search;
			}

			const sameRow: Set<IGraphNode> = new Set();
			const sameColumn: Set<IGraphNode> = new Set();
			const sameColor: Set<IGraphNode> = new Set();

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
				await pageController.placeQueen(node);

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
			logger.debug(`Searching color ${colorId} (${graph.colorInfo[colorId]})`);

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
					await pageController.placeCross(node);
					await graph.excludeCell(node);
				}
				continue search;
			}
		}

		continueSearch = false;
	}
}

export default PlayQueens;
