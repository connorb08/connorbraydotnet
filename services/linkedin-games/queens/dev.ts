import logger from "clog";
import { SolutionFactory } from "./src";
import { PageController } from "./src/page-controller/playwright";

logger.logLevel = "trace";
logger.debug("Start");
const start = performance.now();
const solution = await SolutionFactory({
	pageController: await PageController(),
});
const end = performance.now();
logger.debug("Stop");
logger.info(`Execution time: ${end - start} milliseconds`);
console.log("Result:", solution);
