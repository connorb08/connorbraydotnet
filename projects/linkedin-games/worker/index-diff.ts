import { DurableObject } from "cloudflare:workers";

export class DockerContainer extends DurableObject<Env> {
	private container: globalThis.Container;

	constructor(ctx: DurableObjectState, env: Env) {
		if (ctx.container === undefined) {
			throw new Error("container is not defined");
		}
		super(ctx, env);
		this.container = ctx.container;
		this.ctx.blockConcurrencyWhile(async () => {
			await this.init();
		});
	}

	private async init() {
		if (!this.container.running) this.container.start({ enableInternet: true });
	}

	override async fetch(req: Request) {
		const url = new URL(req.url.replace("https:", "http:"));
		try {
			return await this.container.getTcpPort(3000).fetch(url, req);
		} catch (err) {
			if (err instanceof Error)
				console.error("Error getting TCP port 3000:", err.message);
			else throw err;
			return new Response("service is unreachable right now", { status: 500 });
		}
	}
	async start(instance: number, containerStart?: ContainerStartupOptions) {
		if (this.container.running) {
			return;
		}
		this.container.start(containerStart);
	}
}

export default {
	async fetch(request, env): Promise<Response> {
		const containerId = env.CONTAINER.idFromName("foo");
		const container = env.CONTAINER.get(containerId);
		await container.start(0, { enableInternet: true });
		const res = await container.fetch(request);
		return res;
		// const id: DurableObjectId = env.CONTAINER.idFromName("foo");
		// const stub = env.CONTAINER.get(id);
		// return await stub.fetch(request);
	},
} satisfies ExportedHandler<Env>;
