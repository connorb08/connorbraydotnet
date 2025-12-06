import type { Kysely } from "kysely";
import type { Database } from "../models";
import { createQueensTable } from "../models/queens";
import { createRepositoryTable } from "../models/repository";

export default async function SetupDatabaseSchema(db: Kysely<Database>): Promise<void> {
	try {
		await createRepositoryTable(db.schema);
		await createQueensTable(db.schema);
	} catch (error) {
		console.error("Error setting up database schema:", error);
		throw error;
	}
}
