import { WorkerEntrypoint } from "cloudflare:workers";
import RouteMessage from "./router";

export class Entrypoint extends WorkerEntrypoint<Env> {
	override async queue(batch: MessageBatch<unknown>): Promise<void> {
		try {
			const [message] = batch.messages;
			if (!message) {
				console.warn("No messages in batch");
				return;
			}

			// todo: validate data using schema validation

			const handler = RouteMessage(this.env, this.ctx, message);

			if (handler === null) {
				console.warn(`No handler found for message: ${JSON.stringify(message)}`);
				return;
			}

			await handler();
		} catch (error) {
			console.error("Error processing queue message:", error);
			throw error;
		}
	}
}

export default Entrypoint;
