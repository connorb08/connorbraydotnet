import type { Insertable, JSONColumnType, SchemaModule, Selectable, Updateable } from "kysely";
import type { QueensSolution } from "types";

export type QueensTable = {
	id: string;
	date: string;
	solution: JSONColumnType<QueensSolution>;
};

export type Queens = Omit<Selectable<QueensTable>, "id">;
export type QueensWithId = Selectable<QueensTable>;
export type NewQueens = Omit<Insertable<QueensTable>, "id" | "date">;
export type QueensUpdate = Updateable<QueensTable>;

export const createQueensTable = (schema: SchemaModule) =>
	schema
		.createTable("queens")
		.ifNotExists()
		.addColumn("id", "text", (col) => col.notNull().primaryKey())
		.addColumn("date", "text", (col) => col.notNull())
		.addColumn("solution", "text", (col) => col.notNull())
		.execute();
