import { WorkerEntrypoint } from "cloudflare:workers";
import { createRequestHandler } from "react-router";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export class Entrypoint extends WorkerEntrypoint<Env> {
	public override async fetch(request: Request): Promise<Response> {
		return requestHandler(request, {
			cloudflare: { env: this.env, ctx: this.ctx },
		});
	}
}

export default Entrypoint;
