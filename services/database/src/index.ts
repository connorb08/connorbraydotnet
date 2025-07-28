import { DurableObject, WorkerEntrypoint } from "cloudflare:workers";
import { Kysely } from "kysely";
import { DODialect } from "kysely-do";
import type { Database } from "./models";
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

	// async createProject(
	// 	name: string,
	// 	description: string,
	// ): Promise<Result<Project>> {
	// 	return CreateNewProject(this.db, { name, description });
	// }

	// async getAll<T extends keyof Database>(
	// 	table: T,
	// ): Promise<Result<Database[T][]>> {
	// 	try {
	// 		return Ok(await this.db.selectFrom(table).selectAll().execute());
	// 	} catch (error) {
	// 		console.error(`Error fetching data from ${table}:`, error);
	// 		return Err(`Error fetching data from ${table}`);
	// 	}
	// }

	async deleteData(): Promise<void> {
		try {
			await this.ctx.storage.deleteAll();
		} catch (error) {
			console.error("Error deleting data:", error);
			throw error;
		}
	}
}

export default class Entrypoint extends WorkerEntrypoint<Env> {
	public override async fetch(_request: Request) {
		await this.env.DATABASE.get(
			this.env.DATABASE.idFromName("default"),
		).deleteData();
		return new Response("Hello World");
	}
}
