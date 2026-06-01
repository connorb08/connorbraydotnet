import { WorkerEntrypoint } from "cloudflare:workers";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import type { RPCResult } from "../../../packages/types/src";
import { type MigrationDatabase, RollbackMigration, RunMigrations } from "./migrate";

export class Entrypoint extends WorkerEntrypoint<Env> {
	public override async fetch() {
		return new Response(JSON.stringify({}));
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
