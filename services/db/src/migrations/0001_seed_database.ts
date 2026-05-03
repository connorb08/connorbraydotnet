import type { Kysely, Migration } from "kysely";
import type { Database } from "../schema";

const colorDefinitions = [
	{ Id: 0, Name: "Red", RGB: "#ef4444" },
	{ Id: 1, Name: "Green", RGB: "#22c55e" },
	{ Id: 2, Name: "Blue", RGB: "#3b82f6" },
];

const cellColors = [
	{ cellId: 0, colorId: 0 },
	{ cellId: 1, colorId: 1 },
	{ cellId: 2, colorId: 2 },
	{ cellId: 3, colorId: 0 },
	{ cellId: 4, colorId: 1 },
	{ cellId: 5, colorId: 2 },
	{ cellId: 6, colorId: 0 },
	{ cellId: 7, colorId: 1 },
];

const DatabaseMigration = {
	up: async (db: Kysely<Database>) => {
		await db.insertInto("Queens_Game").values({ Id: "test", Date: 0 }).execute();

		await db
			.insertInto("Queens_Definition")
			.values({
				GameId: "test",
				SideLength: 8,
				ColorDefinitions: JSON.stringify(colorDefinitions),
				CellColors: JSON.stringify(cellColors),
			})
			.execute();
	},
	down: async (db: Kysely<Database>) => {
		await db.deleteFrom("Queens_Game").execute();
	},
} satisfies Migration;

export default DatabaseMigration;
