import { WorkerEntrypoint } from "cloudflare:workers";

export class MainEntrypoint extends WorkerEntrypoint<Env> {
	public override async fetch(_request: Request): Promise<Response> {
		return new Response("Hello");
	}
}

export default MainEntrypoint;
