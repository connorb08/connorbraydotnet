import { DurableObject, WorkerEntrypoint } from "cloudflare:workers";
import { Kysely } from "kysely";
import { DODialect } from "kysely-do";
import type { QueensSolution } from "types";
import { GetCurrentQueens, PutQueens } from "./data/queens";
import type { Database, Queens } from "./models";
import SetupDatabaseSchema from "./schema";
import type { Result } from "./utils";

export class DatabaseObject extends DurableObject<Env> {
	private db: Kysely<Database>;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.db = new Kysely<Database>({
			dialect: new DODialect({ ctx }),
		});

		ctx.blockConcurrencyWhile(async () => {
			try {
				await SetupDatabaseSchema(this.db);
			} catch (error) {
				console.error("Error initializing Kysely:", error);
			}
		});
	}

	public async putQueens(solution: QueensSolution): Promise<Result<Queens>> {
		return await PutQueens(this.db, solution);
	}

	public async getQueens(): Promise<Result<Queens>> {
		return await GetCurrentQueens(this.db);
	}

	async deleteData(): Promise<void> {
		try {
			await this.ctx.storage.deleteAll();
		} catch (error) {
			console.error("Error deleting data:", error);
			throw error;
		}
	}
}

export class Entrypoint extends WorkerEntrypoint<Env> {
	public async getQueens(): Promise<Result<Queens>> {
		return await this.env.DATABASE.get(
			this.env.DATABASE.idFromName("default"),
		).getQueens();
	}
	public async putQueens(solution: QueensSolution): Promise<Result<Queens>> {
		return await this.env.DATABASE.get(
			this.env.DATABASE.idFromName("default"),
		).putQueens(solution);
	}
}

export default Entrypoint;
