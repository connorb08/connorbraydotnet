import { DurableObject } from "cloudflare:workers";
import { Kysely } from "kysely";
import { DODialect } from "kysely-do";
import { CreateNewProject, GetAllProjects } from "./data/project";
import type { Database, Project } from "./models";
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

	async createProject(
		name: string,
		description: string,
	): Promise<Result<Project>> {
		return CreateNewProject(this.db, { name, description });
	}

	async getProjects(): Promise<Result<Project[]>> {
		return GetAllProjects(this.db);
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

export default {
	async fetch(request, env, _ctx): Promise<Response> {
		const id: DurableObjectId = env.DATABASE.idFromName("foo");
		const stub = env.DATABASE.get(id);

		const path = new URL(request.url).pathname;
		switch (path) {
			case "/projects": {
				const { error, data } = await stub.getProjects();
				if (error) {
					return new Response(
						JSON.stringify({ error: "Error getting projects" }),
						{ status: 500 },
					);
				}
				return new Response(JSON.stringify(data));
			}
			case "/project/create": {
				const { error, data } = await stub.createProject(
					"New Project",
					"Project Description",
				);
				if (error) {
					return new Response(
						JSON.stringify({ error: "Error creating project" }),
						{ status: 500 },
					);
				}
				return new Response(JSON.stringify(data));
			}
			case "/delete": {
				await stub.deleteData();
				return new Response("Data deleted");
			}
			default:
				return new Response("Not Found", { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;
