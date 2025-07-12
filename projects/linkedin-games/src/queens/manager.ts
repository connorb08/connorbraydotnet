import { logger } from "#utils/Logger";
import { findSolution } from "./algorithm";
import { Graph } from "./graph";
import type { IPageController } from "./page-controller/types";

/**
 * SolutionManager
 *
 * This module handles the Queens game on LinkedIn
 *
 * It initializes the game, finds the solution, and returns the result.
 */
const SolutionManager = async ({
	pageController,
}: {
	pageController: IPageController;
}) => {
	const graph = new Graph();
	await pageController.start();
	await pageController.populateGraph(graph);
	await pageController.dispose();
	await findSolution(graph);
	logger.debug("Nodes in graph:", graph.nodes.size);
	return graph.gameData;
};

export { SolutionManager };
