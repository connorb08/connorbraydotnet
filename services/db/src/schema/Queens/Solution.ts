import type { JSONColumnType } from "kysely";

export type Solution = {
	GameId: string;

	/**
	 * Value: Cell Id of a placed queen
	 */
	Queens: JSONColumnType<[number]>;

	/**
	 * Value: Cell Id of a removed cell
	 */
	Removed: JSONColumnType<[number]>;
};
