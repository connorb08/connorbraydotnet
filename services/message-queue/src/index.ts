import { WorkerEntrypoint } from "cloudflare:workers";
import type { QueensSolution } from "types";

export class Entrypoint extends WorkerEntrypoint<Env> {
	override async queue(batch: MessageBatch<unknown>): Promise<void> {
		try {
			const [message] = batch.messages;
			if (!message) {
				console.warn("No messages in batch");
				return;
			}

			const messageBody = message.body as unknown as QueensSolution;

			// todo: validate data using schema validation

			const { error, data } = await this.env.DATABASE.putQueens(messageBody);

			if (error !== undefined) {
				console.error("Error putting queens solution in database:", error);
				message.ack();
				return;
			}

			console.log(data);
			message.ack();
		} catch (error) {
			console.error("Error processing queue message:", error);
			throw error;
		}
	}
}

export default Entrypoint;
