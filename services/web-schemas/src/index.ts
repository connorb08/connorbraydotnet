import { WorkerEntrypoint } from "cloudflare:workers";

export class Entrypoint extends WorkerEntrypoint<Env> {
	override async fetch(_request: Request) {
		return new Response("Hello World!");
	}
}

export default Entrypoint;
