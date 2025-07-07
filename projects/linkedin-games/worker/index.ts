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
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		console.log("Scheduled event triggered");
		const container = getContainer(env.CONTAINER);
		await container.startAndWaitForPorts(3000);
		const res = await container.fetch(request);
		console.log("Container response:", res);
		// await container.start();
		// console.log("Container started successfully");
		return new Response(
			"This Worker runs a cron job to execute a container on a schedule.",
		);
	},
	async scheduled(controller, env, ctx) {
		console.log("Scheduled event triggered");
		const container = getContainer(env.CONTAINER);
		await container.start();
		console.log("Container started successfully");

		// await container.start({
	},
	// async fetch(request, env, ctx): Promise<Response> {
	// 	try {
	// 		const container = getContainer(env.CONTAINER);
	// 		const res = await container.fetch(request);
	// 		console.log("Container response:", res);
	// 		return new Response("res");
	// 	} catch (error) {
	// 		return new Response("err");
	// 	}
	// },
} satisfies ExportedHandler<Env>;
