import { DurableObject, WorkerEntrypoint } from "cloudflare:workers";
import { Kysely } from "kysely";
import { DODialect } from "kysely-do";
import type { QueensSolution, RPCResult } from "types";
import { GetCurrentQueens, PutQueens } from "./data/queens";
import type { Database, Queens } from "./models";
import SetupDatabaseSchema from "./schema";

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

	public async putQueens(solution: QueensSolution): Promise<RPCResult<Queens>> {
		const result = PutQueens(this.db, solution);
		this.ctx.waitUntil(result);
		return result;
	}

	public async getQueens(): Promise<RPCResult<Queens>> {
		const result = GetCurrentQueens(this.db);
		this.ctx.waitUntil(result);
		return result;
	}

	async deleteData(): Promise<void> {
		try {
			this.ctx.waitUntil(this.ctx.storage.deleteAll());
			return;
		} catch (error) {
			console.error("Error deleting data:", error);
			throw error;
		}
	}
}

export class Entrypoint extends WorkerEntrypoint<Env> {
	public async getQueens(): Promise<RPCResult<Queens>> {
		const result = this.env.DATABASE.get(
			this.env.DATABASE.idFromName("default"),
		).getQueens();
		this.ctx.waitUntil(result);
		return result;
	}
	public async putQueens(solution: QueensSolution): Promise<RPCResult<Queens>> {
		const result = this.env.DATABASE.get(
			this.env.DATABASE.idFromName("default"),
		).putQueens(solution);
		this.ctx.waitUntil(result);
		return result;
	}
}

export default Entrypoint;
