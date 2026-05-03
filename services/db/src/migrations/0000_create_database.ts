import { type Kysely, type Migration, sql } from "kysely";
import type { Database } from "../schema";

const DatabaseMigration = {
	up: async (db: Kysely<Database>) => {
		await db.schema
			.createTable("Queens_Game")
			.ifNotExists()
			.addColumn("Id", "text", (col) => col.notNull().unique().primaryKey())
			.addColumn("Date", "integer", (col) =>
				col.notNull().unique().defaultTo(sql<number>`(unixepoch('now'))`),
			)
			.execute();

		await db.schema
			.createTable("Queens_Definition")
			.ifNotExists()
			.addColumn("GameId", "text", (col) =>
				col.notNull().unique().references("Queens_Game.Id").onDelete("cascade"),
			)
			.addColumn("SideLength", "integer", (col) => col.notNull())
			.addColumn("ColorDefinitions", "text", (col) => col.notNull())
			.addColumn("CellColors", "text", (col) => col.notNull())
			.execute();

		await db.schema
			.createTable("Queens_Solution")
			.ifNotExists()
			.addColumn("GameId", "text", (col) =>
				col.notNull().unique().references("Queens_Game.Id").onDelete("cascade"),
			)
			.addColumn("Text", "text", (col) => col.notNull())
			.execute();

		await db.schema
			.createTable("Queens_Logs")
			.ifNotExists()
			.addColumn("GameId", "text", (col) =>
				col.notNull().unique().references("Queens_Game.Id").onDelete("cascade"),
			)
			.addColumn("Text", "text", (col) => col.notNull())
			.execute();
	},
	down: async (db: Kysely<Database>) => {
		await db.schema.dropTable("Queens_Logs").ifExists().execute();
		await db.schema.dropTable("Queens_Solution").ifExists().execute();
		await db.schema.dropTable("Queens_Definition").ifExists().execute();
		await db.schema.dropTable("Queens_Game").ifExists().execute();
	},
} satisfies Migration;

export default DatabaseMigration;
