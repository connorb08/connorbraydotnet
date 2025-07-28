import { WorkerEntrypoint } from "cloudflare:workers";
import type { GameData } from "shared";

export class MainEntrypoint extends WorkerEntrypoint<Env> {
	public override async fetch(_request: Request): Promise<Response> {
		try {
			await using solution = await this.env.LINKEDIN_GAMES.getResult();
			return new Response(JSON.stringify(solution), { status: 200 });
		} catch (_error) {
			console.error(_error);
			return new Response("Internal Server Error", { status: 500 });
		}
	}
	async queensResult(): Promise<GameData> {
		return await this.env.LINKEDIN_GAMES.getResult();
	}
}

export default MainEntrypoint;
