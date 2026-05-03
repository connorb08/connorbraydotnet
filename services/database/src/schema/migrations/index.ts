import type { Migration, MigrationProvider } from "kysely";
import { createQueensTable } from "../../models/queens";

const migrations: Record<string, Migration> = {
	"0001_create_queens_table": {
		async up(db) {
			await createQueensTable(db.schema);
		},
		async down(db) {
			await db.schema.dropTable("queens").ifExists().execute();
		},
	},
};

export const migrationProvider: MigrationProvider = {
	async getMigrations() {
		return migrations;
	},
};
