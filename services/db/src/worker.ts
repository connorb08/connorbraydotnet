import { WorkerEntrypoint } from "cloudflare:workers";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import type { RPCResult } from "../../../packages/types/src";
import SetupDatabaseSchema from "./migrate";
import type { Database } from "./schema";

export class Entrypoint extends WorkerEntrypoint<Env> {
	public override async fetch(_request: Request): Promise<Response> {
		return new Response("Hello, World!");
	}

	public async RunMigrations(): Promise<RPCResult<string>> {
		try {
			const db = new Kysely<Database>({
				dialect: new D1Dialect({ database: this.env.DB }),
			});
			await SetupDatabaseSchema(db);
			return { data: "Migrations run successfully." };
		} catch (error) {
			if (Error.isError(error)) {
				console.error("Error running migrations:", error);
				return { error: "Error running migrations" };
			}
			return { error: "Unknown error running migrations" };
		}
	}
}

export default Entrypoint;
