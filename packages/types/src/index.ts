export type { QueensSolution } from "./linkedin-games";

export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};
