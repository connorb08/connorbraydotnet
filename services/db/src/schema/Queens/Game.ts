import type { Generated } from "kysely";

export type Game = {
	/**
	 * UUID7 — Timestamped
	 */
	Id: string;

	/**
	 * Unix epoch time
	 */
	Date: Generated<number>;
};
