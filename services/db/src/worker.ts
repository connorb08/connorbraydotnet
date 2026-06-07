import { WorkerEntrypoint } from "cloudflare:workers";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import type { RPCResult } from "../../../packages/types/src";
import { type MigrationDatabase, RollbackMigration, RunMigrations } from "./migrate";
import type { Database } from "./schema";

export class Entrypoint extends WorkerEntrypoint<Env> {
	public override async fetch() {
		return new Response(JSON.stringify({}));
	}

	public async GetQueens() {
		const db = new Kysely<Database>({
			dialect: new D1Dialect({ database: this.env.DB }),
		});
		const data = await db
			.selectFrom("Queens_Game")
			.innerJoin("Queens_Definition", "Queens_Game.Id", "Queens_Definition.GameId")
			.innerJoin("Queens_Solution", "Queens_Game.Id", "Queens_Solution.GameId")
			.orderBy("Queens_Game.Id", "desc")
			.top(1)
			.selectAll()
			.executeTakeFirst();
		console.log("Data fetched from D1:", data);
		return data;
	}

	public async RunMigrations(): Promise<RPCResult<string>> {
		try {
			const db = new Kysely<MigrationDatabase>({
				dialect: new D1Dialect({ database: this.env.DB }),
			});
			await RunMigrations(db);
			return { data: "Migrations run successfully." };
		} catch (error) {
			if (Error.isError(error)) {
				console.error("Error running migrations:", error);
				return { error: "Error running migrations" };
			}
			return { error: "Unknown error running migrations" };
		}
	}

	public async RollbackMigration(n?: number | undefined): Promise<RPCResult<string>> {
		try {
			const db = new Kysely<MigrationDatabase>({
				dialect: new D1Dialect({ database: this.env.DB }),
			});
			await RollbackMigration(db, n);
			return { data: "Migration rolled back successfully." };
		} catch (error) {
			if (Error.isError(error)) {
				console.error("Error rolling back migration:", error);
				return { error: "Error rolling back migration" };
			}
			return { error: "Unknown error rolling back migration" };
		}
	}
}

export default Entrypoint;
