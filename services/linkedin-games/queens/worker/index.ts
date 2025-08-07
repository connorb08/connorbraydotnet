import { WorkerEntrypoint } from "cloudflare:workers";
import type { QueensSolution } from "types";
import { PageController } from "#src/page-controller/cloudflare";
import { SolutionFactory } from "../src";

export class Entrypoint extends WorkerEntrypoint<Env> {
	public async solve(): Promise<QueensSolution> {
		const res = SolutionFactory({
			pageController: await PageController(this.env.BROWSER),
		});
		this.ctx.waitUntil(res);
		return res;
	}

	public async scheduledHandler(): Promise<void> {
		const solution = await this.solve();
		this.ctx.waitUntil(this.env.DATABASE.putQueens(solution));
	}

	public override async scheduled(_: ScheduledController): Promise<void> {
		this.ctx.waitUntil(this.scheduledHandler());
	}
}

export default Entrypoint;
