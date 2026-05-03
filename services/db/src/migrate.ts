import type { Kysely, Migration, MigrationProvider } from "kysely";
import { migrationLoaders } from "./migrations";
import type { Database } from "./schema";

type MigrationModule = {
	default: Migration;
};

type MigrationDatabase = {
	migrations: {
		name: string;
		timestamp: string;
	};
};

const migrationProvider: MigrationProvider = {
	async getMigrations() {
		const migrations = await Promise.all(
			Object.entries(migrationLoaders).map(async ([migrationName, loadMigration]) => {
				const module = (await loadMigration()) as MigrationModule;
				return [migrationName, module.default] as const;
			}),
		);

		return Object.fromEntries(migrations);
	},
};

export default async function SetupDatabaseSchema(db: Kysely<Database>): Promise<void> {
	try {
		const migrationDb = db as unknown as Kysely<MigrationDatabase>;
		const migrations = await migrationProvider.getMigrations();

		await migrationDb.schema
			.createTable("migrations")
			.ifNotExists()
			.addColumn("name", "varchar(255)", (column) => column.primaryKey().notNull())
			.addColumn("timestamp", "varchar(255)", (column) => column.notNull())
			.execute();

		const completedMigrations = await migrationDb.selectFrom("migrations").select("name").execute();
		const completedMigrationNames = new Set(completedMigrations.map(({ name }) => name));
		const pendingMigrations = Object.entries(migrations)
			.filter(([migrationName]) => !completedMigrationNames.has(migrationName))
			.sort(([left], [right]) => left.localeCompare(right));

		await pendingMigrations.reduce(async (previousMigration, [migrationName, migration]) => {
			await previousMigration;
			await migration.up(db);
			await migrationDb
				.insertInto("migrations")
				.values({ name: migrationName, timestamp: new Date().toISOString() })
				.execute();

			console.log(`[database] migration ${migrationName}: Success`);
		}, Promise.resolve());
	} catch (error) {
		console.error("Error setting up database schema:", error);
		throw error;
	}
}
