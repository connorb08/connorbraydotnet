import { WorkerEntrypoint } from "cloudflare:workers";
import type { QueensSolution } from "types";
import { PageController } from "#src/page-controller/cloudflare";
import { SolutionFactory } from "../src";

export class Entrypoint extends WorkerEntrypoint<Env> {
	public async solve(): Promise<QueensSolution> {
		const res = await SolutionFactory({
			pageController: await PageController(this.env.BROWSER),
		});
		return res;
	}

	public async scheduledHandler(): Promise<QueensSolution> {
		const solution = await this.solve();
		await this.env.DATABASE.putQueens(solution);
		return solution;
	}

	public override async scheduled(_: ScheduledController): Promise<void> {
		try {
			await this.scheduledHandler();
		} catch (error) {
			if (Error.isError(error)) {
				console.error(`Caught error in scheduled handler: ${error.message}. Stack: ${error.stack}`);
			}
		}
	}
}

export default Entrypoint;
