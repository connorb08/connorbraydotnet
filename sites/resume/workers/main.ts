import { WorkerEntrypoint } from "cloudflare:workers";
import { createRequestHandler } from "react-router";
import { ValidateResume, type ValidationResponse } from "shared";

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
		return requestHandler(request, {
			cloudflare: { env, ctx },
		});
	}

	public async validate(data: unknown): Promise<ValidationResponse> {
		try {
			return ValidateResume(data);
		} catch (e) {
			console.error(e);
			return {
				ok: false,
				errors: ["Unknown Server Error"],
			};
		}
	}
}
