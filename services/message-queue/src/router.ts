import type { QueueMessage } from "types";
import { HandleMessage as QueensHandler } from "./queens";
import type { MessageHandler } from "./types";

export default function RouteMessage(
	env: Env,
	ctx: ExecutionContext,
	message: Message,
): MessageHandler | null {
	const data = message.body as QueueMessage<unknown>;
	const key = data.queueKey;

	switch (key) {
		case "queens":
			return () => QueensHandler(env, ctx, message);
		default:
			console.warn(`Unknown queue message key: ${key}`);
			return null;
	}
}
