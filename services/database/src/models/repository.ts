import type { Insertable, SchemaModule, Selectable, Updateable } from "kysely";

export type RepositoryTable = {
	id: string;
	name: string;
	url: string;
	public: boolean;
	linesOfCode: number;
};

export type Repository = Omit<Selectable<RepositoryTable>, "id">;
export type NewRepository = Omit<Insertable<RepositoryTable>, "id">;
export type RepositoryUpdate = Updateable<RepositoryTable>;

export async function createRepositoryTable(schema: SchemaModule) {
	return schema
		.createTable("repositories")
		.ifNotExists()
		.addColumn("id", "text", (col) => col.notNull().primaryKey())
		.addColumn("name", "text", (col) => col.notNull())
		.addColumn("url", "text", (col) => col.notNull())
		.addColumn("public", "boolean", (col) => col.notNull())
		.addColumn("linesOfCode", "integer", (col) => col.notNull())
		.execute();
}
