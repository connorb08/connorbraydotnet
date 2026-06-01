import type { Kysely, Migration, MigrationProvider } from "kysely";
import { migrationLoaders } from "./migrations";

type MigrationModule = {
	default: Migration;
};

export type MigrationDatabase = {
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

export async function RunMigrations(db: Kysely<MigrationDatabase>): Promise<void> {
	try {
		const migrations = await migrationProvider.getMigrations();

		await db.schema
			.createTable("migrations")
			.ifNotExists()
			.addColumn("name", "varchar(255)", (column) => column.primaryKey().notNull())
			.addColumn("timestamp", "varchar(255)", (column) => column.notNull())
			.execute();

		const completedMigrations = await db
			.selectFrom("migrations")
			.select("name")
			.execute();

		const completedMigrationNames = new Set(completedMigrations.map(({ name }) => name));
		const pendingMigrations = Object.entries(migrations)
			.filter(([migrationName]) => !completedMigrationNames.has(migrationName))
			.sort(([left], [right]) => left.localeCompare(right));

		await pendingMigrations.reduce(
			async (previousMigration, [migrationName, migration]) => {
				await previousMigration;
				await migration.up(db);
				await db
					.insertInto("migrations")
					.values({ name: migrationName, timestamp: new Date().toISOString() })
					.execute();

				console.log(`[database] migration ${migrationName}: Success`);
			},
			Promise.resolve(),
		);
	} catch (error) {
		console.error("Error setting up database schema:", error);
		throw error;
	}
}

export async function RollbackMigration(
	db: Kysely<MigrationDatabase>,
	n: number | undefined = 1,
): Promise<void> {
	try {
		const migrationDb = db as unknown as Kysely<MigrationDatabase>;
		const migrations = await migrationProvider.getMigrations();

		await db.transaction().execute(async (trx) => {
			const completedMigrations = await trx
				.selectFrom("migrations")
				.select("name")
				.orderBy("timestamp", "desc")
				.limit(n ?? 1)
				.execute();

			if (completedMigrations.length === 0) {
				console.log("[database] no migrations to roll back");
				return;
			}

			for (const { name } of completedMigrations) {
				const migration = migrations[name];
				if (!migration?.down) {
					throw new Error(`Migration ${name} does not have a down function`);
				}

				// biome-ignore lint/performance/noAwaitInLoops: migrations must be rolled back in order
				await migration.down(db);
				await migrationDb.deleteFrom("migrations").where("name", "=", name).execute();

				console.log(`[database] rolled back migration ${name}: Success`);
			}
		});

		// const completedMigrations = await migrationDb
		// 	.selectFrom("migrations")
		// 	.select("name")
		// 	.orderBy("timestamp", "desc")
		// 	.limit(n ?? 1)
		// 	.execute();

		// if (completedMigrations.length === 0) {
		// 	console.log("[database] no migrations to roll back");
		// 	return;
		// }

		// for (const { name } of completedMigrations) {
		// 	const migration = migrations[name];
		// 	if (!migration?.down) {
		// 		throw new Error(`Migration ${name} does not have a down function`);
		// 	}

		// 	// biome-ignore lint/performance/noAwaitInLoops: migrations must be rolled back in order
		// 	await migration.down(db);
		// 	await migrationDb.deleteFrom("migrations").where("name", "=", name).execute();

		// 	console.log(`[database] rolled back migration ${name}: Success`);
		// }

		// biome-ignore lint/style/noNonNullAssertion: already checked length
		// const lastMigrationName = completedMigrations[0]!.name;
		// const migration = migrations[lastMigrationName];

		// if (!migration?.down) {
		// 	throw new Error(`Migration ${lastMigrationName} does not have a down function`);
		// }

		// await migration.down(db);
		// await migrationDb
		// 	.deleteFrom("migrations")
		// 	.where("name", "=", lastMigrationName)
		// 	.execute();

		console.log(`[database] rolled back ${n ?? 1} migration(s): Success`);
	} catch (error) {
		console.error("Error rolling back migration:", error);
		throw error;
	}
}
