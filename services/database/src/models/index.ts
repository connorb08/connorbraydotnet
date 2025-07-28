import type { Insertable, Selectable, Updateable } from "kysely";
import type { Prettify, QueensSolution } from "types";

export type Database = {
	project: ProjectTable;
	queens: QueensTable;
};

type ProjectTable = {
	id: string;
	name: string;
	description: string;
};

type QueensTable = Prettify<
	{
		id: string;
	} & QueensSolution
>;

export type Project = Omit<Selectable<ProjectTable>, "id">;
export type ProjectWithId = Selectable<ProjectTable>;
export type NewProject = Omit<Insertable<ProjectTable>, "id">;
export type ProjectUpdate = Updateable<ProjectTable>;
