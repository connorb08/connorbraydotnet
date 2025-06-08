import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
	project: ProjectTable;
}

interface ProjectTable {
	id: Generated<string>;
	name: string;
	description: string;
}

export type Project = Omit<Selectable<ProjectTable>, "id">;
export type ProjectWithId = Selectable<ProjectTable>;
export type NewProject = Insertable<ProjectTable>;
export type ProjectUpdate = Updateable<ProjectTable>;
