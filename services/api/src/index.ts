import { WorkerEntrypoint } from "cloudflare:workers";
import type { QueensSolution } from "types";

export class MainEntrypoint extends WorkerEntrypoint<Env> {
	public override async fetch(_request: Request): Promise<Response> {
		return new Response("Hello");
	}
	public async solveQueens(): Promise<QueensSolution> {
		return this.env.QUEENS.solve();
	}
}

export default MainEntrypoint;
