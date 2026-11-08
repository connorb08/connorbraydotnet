import type { Database } from "../models";
import type { Kysely } from "kysely";
import { migrationProvider } from "./migrations";
import { Migrator } from "kysely";

export default async function SetupDatabaseSchema(db: Kysely<Database>): Promise<void> {
	try {
		const migrator = new Migrator({
			db,
			provider: migrationProvider,
		});
		const { error, results } = await migrator.migrateToLatest();

		if (results) {
			for (const result of results) {
				console.log(`[database] migration ${result.migrationName}: ${result.status}`);
			}
		}

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error setting up database schema:", error);
		throw error;
	}
}
