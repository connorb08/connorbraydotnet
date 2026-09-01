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

	async alert(subject: string, message: string): Promise<Response> {
		try {
			const [from, recipients] = [this.env.EMAIL_FROM, this.env.EMAIL_RECIPIENTS];
			const to = recipients.split(",").map((recipient) => recipient.trim());

			const msg = {
				to,
				from,
				subject,
				text: message,
			} as EmailMessageBuilder;

			const response = await this.env.EMAIL.send(msg);

			return new Response(`Email sent: ${response.messageId}`);
		} catch (error) {
			console.error("Error processing request:", error);
			return new Response("Internal Server Error", { status: 500 });
		}
	}
}
