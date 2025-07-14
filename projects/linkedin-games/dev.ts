import config from "#config";
import logger from "#logger";
import { SolutionManager } from "#src/queens/index";
import { PageController } from "#src/queens/page-controller/playwright";

logger.debug("Setting envioronment variables");
config.env = import.meta.env as Record<string, string>;
logger.debug("Environment variables set");

logger.debug("Start");
const start = performance.now();
const queenLocations = await SolutionManager({
	pageController: await PageController(),
});
const end = performance.now();
logger.debug("Stop");
logger.debug(`Execution time: ${end - start} milliseconds`);
console.log("Result:", queenLocations);
