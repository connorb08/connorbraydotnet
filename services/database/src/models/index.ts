import type { QueensTable } from "./queens";
import type { RepositoryTable } from "./repository";

export type Database = {
	queens: QueensTable;
	repositories: RepositoryTable;
};

export type * from "./queens";
export type * from "./repository";
