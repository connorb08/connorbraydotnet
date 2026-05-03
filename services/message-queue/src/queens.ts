import type { CloudflareDTO } from "types";

export async function HandleMessage(env: Env, _ctx: ExecutionContext, message: Message) {
	const body = message.body as CloudflareDTO;

	const { error, data } = await env.DATABASE.putQueens(body.definition, body.solution, body.steps);

	if (error !== undefined) {
		console.error("Error putting queens solution in database:", error);
		message.ack();
		return;
	}

	console.log(data);
	message.ack();
	return;
}
