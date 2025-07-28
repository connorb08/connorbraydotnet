import logger from "clog";
import type { QueensSolution } from "types";
import { Graph } from "./graph";
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
}): Promise<QueensSolution> => {
	logger.debug("Starting SolutionFactory");
	const graph = new Graph();
	await pageController.start();
	await pageController.constructGraph(graph);
	await pageController.dispose();
	return graph.findSolution();
};

export { SolutionFactory };
