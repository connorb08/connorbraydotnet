import { WorkerEntrypoint } from "cloudflare:workers";

export default class APIWorker extends WorkerEntrypoint<Env> {
	async linkedinGames(): Promise<Response> {
		return new Response("LinkedIn Games API is running.");
	}
}
