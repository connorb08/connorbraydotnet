import type { CloudflareDTO } from "types";

export async function processQueensMessage(env: Env, message: Message, body: CloudflareDTO) {
	const { error, data } = await env.DATABASE.putQueens(body.solution, body.steps);

	if (error !== undefined) {
		console.error("Error putting queens solution in database:", error);
		message.ack();
		return;
	}

	console.log(data);
	message.ack();
	return;
}
