import { Container, getContainer } from "@cloudflare/containers";

type StopParams = {
	exitCode: number;
	reason: "exit" | "runtime_signal";
};

export class DockerContainer extends Container {
	override sleepAfter = "5m";
	override defaultPort = 3000;
	override requiredPorts = [3000];
	// manualStart = true;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.ctx.blockConcurrencyWhile(async () => {
			const container = this.ctx.container;
			if (!container) {
				throw new Error("Container is not available");
			}
			container.start({
				entrypoint: ["node", "index.js"],
				enableInternet: false,
			});
		});
	}

	override onStart() {
		console.log("Container started");
	}

	override onStop(params: StopParams) {
		if (params.exitCode === 0) {
			console.log("Container stopped successfully");
		} else {
			console.error(
				`Container stopped with exit code ${params.exitCode} due to ${params.reason}`,
			);
		}
	}

	override onError(error: unknown) {
		console.error("Container error:", error);
	}

	async getData() {
		console.log("Fetching data from container...");
		const container = this.ctx.container;
		if (!container) {
			throw new Error("Container is not available");
		}
		console.log(container.running);
		const port = container.getTcpPort(3000);
		console.log("Container port:", port);
		const res = await port.fetch("http://connorbray.net:3000");
		console.log("Response from container:", res);
		return await res.text();
	}

}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const container = getContainer(env.CONTAINER);
		const res = await container.getData();
		console.log("Container response:", res);
		return new Response(
			"This Worker runs a cron job to execute a container on a schedule.",
		);
	},
	async scheduled(controller, env, ctx) {
		try {
			console.log("Scheduled event triggered");
			const container = getContainer(env.CONTAINER);
			const res = await container.fetch("http://connorbray.net:3000");
			console.log("Container response:", res);
		} catch (error) {
			console.error("Error starting container:", error);
			throw error;
		}
	},
} satisfies ExportedHandler<Env>;
