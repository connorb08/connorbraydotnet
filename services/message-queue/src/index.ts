import { WorkerEntrypoint } from "cloudflare:workers";
import type { CloudflareDTO } from "types";
import { processQueensMessage } from "./queens";

export class Entrypoint extends WorkerEntrypoint<Env> {
	override async queue(batch: MessageBatch<unknown>): Promise<void> {
		try {
			const [message] = batch.messages;
			if (!message) {
				console.warn("No messages in batch");
				return;
			}

			// CloudflareDTO
			const data = message.body as unknown as CloudflareDTO;

			// todo: validate data using schema validation

			switch (data.id) {
				case "queens":
					return processQueensMessage(this.env, message, data);
				default:
					console.warn(`Unknown queue message id: ${data.id}`);
					return;
			}
		} catch (error) {
			console.error("Error processing queue message:", error);
			throw error;
		}
	}
}

export default Entrypoint;
