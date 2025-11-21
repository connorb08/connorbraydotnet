import type { Kysely } from "kysely";
import type { Database } from "../models";

export default async function SetupDatabaseSchema(db: Kysely<Database>): Promise<void> {
	try {
		await db.schema
			.createTable("queens")
			.ifNotExists()
			.addColumn("id", "text", (col) => col.notNull().primaryKey())
			.addColumn("date", "text", (col) => col.notNull())
			.addColumn("solution", "text", (col) => col.notNull())
			.execute();
	} catch (error) {
		console.error("Error setting up database schema:", error);
		throw error;
	}
}
