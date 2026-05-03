import { WorkerEntrypoint } from "cloudflare:workers";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import SetupDatabaseSchema from "./migrate";
import type { Database } from "./schema";

export class Entrypoint extends WorkerEntrypoint<Env> {
	override async fetch(request: Request): Promise<Response> {
		const key = new URL(request.url).searchParams.get("key");

		if (key === "run-migrations") {
			await this.runMigrations();
			return new Response("Migrations run successfully.", { status: 200 });
		}

		return new Response("Hello, World!");
	}

	private async runMigrations(): Promise<void> {
		const db = new Kysely<Database>({
			dialect: new D1Dialect({ database: this.env.DB }),
		});
		await SetupDatabaseSchema(db);
	}
}

export default Entrypoint;
