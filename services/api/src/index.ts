import { WorkerEntrypoint } from "cloudflare:workers";

export default class Entrypoint extends WorkerEntrypoint<Env> {
	public override async fetch(_request: Request): Promise<Response> {
		const body = JSON.stringify({
			status: "healthy",
		});

		return new Response(body, {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	public async alert(subject: string, message: string): Promise<Response> {
		try {
			const res = await this.env.ALERTS.alert(subject, message);
			return res;
		} catch (error) {
			console.error("Error sending alert:", error);
			return new Response("Failed to send alert", { status: 500 });
		}
	}
}
