import type {
	Definition as Queens_Definition,
	Game as Queens_Game,
	Logs as Queens_Logs,
	Solution as Queens_Solution,
} from "./Queens";

export type Database = {
	Queens_Definition: Queens_Definition;
	Queens_Game: Queens_Game;
	Queens_Solution: Queens_Solution;
	Queens_Logs: Queens_Logs;
};
