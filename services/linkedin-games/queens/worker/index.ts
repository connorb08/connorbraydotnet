import { WorkerEntrypoint } from "cloudflare:workers";
import logger from "clog";
import type { QueensSolution } from "types";
import { PageController } from "#src/page-controller/cloudflare";
import { SolutionFactory } from "../src";

export class Entrypoint extends WorkerEntrypoint<Env> {
	public async solve(): Promise<QueensSolution> {
		return await SolutionFactory({
			pageController: await PageController(this.env.BROWSER),
		});
	}

	public override async scheduled(_: ScheduledController): Promise<void> {
		try {
			const solution = await this.solve();
			await this.env.DATABASE.putQueens(solution);
			logger.debug("Game solved and result stored successfully.");
		} catch (error) {
			logger.error("Error solving game:", error);
		}
	}
}

export default Entrypoint;
