import { WorkerEntrypoint } from "cloudflare:workers";
import { createRequestHandler, RouterContextProvider } from "react-router";
import { cfContext } from "~/context";

// import { Resume } from "schemas";

// import { ValidateResume, type ValidationResponse } from "shared";

interface IMainEntrypoint {
	fetch(request: Request): Response | Promise<Response>;
}

const requestHandler = createRequestHandler(
	/* istanbul ignore next */
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default class MainEntrypoint
	extends WorkerEntrypoint<Env>
	implements IMainEntrypoint
{
	/**
	 * Default HTTP Handler
	 */
	public override async fetch(request: Request): Promise<Response> {
		const [env, ctx] = [this.env, this.ctx];
		const context = new RouterContextProvider();
		context.set(cfContext, { env, ctx });
		return requestHandler(request, context);
	}
}
