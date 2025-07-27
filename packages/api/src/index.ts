import { WorkerEntrypoint } from "cloudflare:workers";
import type { GameData } from "shared";

export default class APIWorker extends WorkerEntrypoint<Env> {
	public override async fetch(_request: Request): Promise<Response> {
		try {
			const solution = await this.env.LINKEDIN_GAMES.getSolution();
			return new Response(JSON.stringify(solution), { status: 200 });
		} catch (_error) {
			return new Response("Internal Server Error", { status: 500 });
		}
	}
	async solveQueens(): Promise<boolean> {
		return await this.env.LINKEDIN_GAMES.solveGame();
	}
	async linkedinGames(date?: string | undefined): Promise<GameData> {
		return await this.env.LINKEDIN_GAMES.getResult(date);
	}
}
