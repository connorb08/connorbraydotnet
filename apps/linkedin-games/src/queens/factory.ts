import logger from "#logger";
import { Graph, type IGraph } from "./data-structures/graph-new";
import type { IPageController } from "./page-controller/types";

/**
 * SolutionFactory
 *
 * This module handles the Queens game on LinkedIn
 *
 * It initializes the game, finds the solution, and returns the result.
 */
const SolutionFactory = async ({
	pageController,
}: {
	pageController: IPageController;
}) => {
	logger.trace("Starting SolutionFactory");
	const graph: IGraph = new Graph();
	await pageController.start();
	await pageController.constructGraph(graph);
	await pageController.dispose();
	return graph.findSolution();
};

export { SolutionFactory };
