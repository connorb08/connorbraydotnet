import type { Kysely, Migration } from "kysely";
import type { Database } from "../schema";

const DatabaseMigration = {
	up: async (db: Kysely<Database>) => {
		await db.insertInto("Queens_Game").values({ Id: "test", Date: 0 }).execute();

		await db
			.insertInto("Queens_Definition")
			.values({
				GameId: "test",
				SideLength: 7,
				Colors: JSON.stringify(
					[
						0, 0, 1, 1, 1, 2, 2, 0, 3, 4, 4, 4, 3, 2, 0, 3, 4, 4, 4, 3, 3, 3, 3, 3, 4, 3,
						3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 3, 6, 6, 3, 3, 3, 5, 3, 6, 6, 3,
					].map((colorId, cellId) => ({ CellId: cellId, ColorId: colorId })),
				),
				CellColors: JSON.stringify([
					{ Id: 0, Name: "Lavender", RGB: "rgb(187, 163, 226)" },
					{ Id: 1, Name: "Peach Orange", RGB: "rgb(255, 201, 146)" },
					{ Id: 2, Name: "Soft Blue", RGB: "rgb(150, 190, 255)" },
					{ Id: 3, Name: "Pastel Green", RGB: "rgb(179, 223, 160)" },
					{ Id: 4, Name: "Light Gray", RGB: "rgb(223, 223, 223)" },
					{ Id: 5, Name: "Vibrant Coral", RGB: "rgb(255, 123, 96)" },
					{ Id: 6, Name: "Lime Yellow", RGB: "rgb(230, 243, 136)" },
				]),
			})
			.execute();

		await db
			.insertInto("Queens_Solution")
			.values({
				GameId: "test",
				Queens: JSON.stringify([24, 14, 13, 29, 44, 4, 40]),
				Removed: JSON.stringify([
					30, 31, 32, 38, 45, 8, 12, 15, 19, 20, 21, 22, 23, 25, 26, 27, 35, 36, 41, 42,
					43, 48, 16, 18, 3, 10, 17, 9, 11, 0, 7, 28, 1, 5, 6, 34, 37, 33, 46, 47, 2, 39,
				]),
			})
			.execute();

		await db
			.insertInto("Queens_Logs")
			.values({
				GameId: "test",
				Text: "Test Log",
			})
			.execute();
	},
	down: async (db: Kysely<Database>) => {
		await db.deleteFrom("Queens_Game").execute();
	},
} satisfies Migration;

export default DatabaseMigration;
