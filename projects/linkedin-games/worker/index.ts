import { Container, getContainer } from "@cloudflare/containers";

export class DockerContainer extends Container {
	override sleepAfter = "10s";
	override defaultPort = 3000;
	override enableInternet = true;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		try {
			const container = getContainer(env.CONTAINER);
			const res = await container.fetch(request);
			console.log("Container response:", res);
			return new Response("res");
		} catch (error) {
			return new Response("err");
		}
	},
} satisfies ExportedHandler<Env>;
