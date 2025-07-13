import { WorkerEntrypoint } from "cloudflare:workers";
import type { GameData } from "shared";

export default class APIWorker extends WorkerEntrypoint<Env> {
	async solveQueens(): Promise<boolean> {
		return await this.env.LINKEDIN_GAMES.solveGame();
	}
	async linkedinGames(date?: string | undefined): Promise<GameData> {
		return await this.env.LINKEDIN_GAMES.getResult(date);
	}
}
