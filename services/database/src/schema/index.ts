import type { Kysely } from "kysely";
import type { Database } from "../models";

export default async function SetupDatabaseSchema(
	db: Kysely<Database>,
): Promise<void> {
	try {
		await db.schema
			.createTable("project")
			.ifNotExists()
			.addColumn("id", "text", (col) => col.notNull().primaryKey())
			.addColumn("name", "text", (col) => col.notNull().unique())
			.addColumn("description", "text", (col) => col.notNull())
			.execute();
	} catch (error) {
		console.error("Error setting up database schema:", error);
		throw error;
	}
}
