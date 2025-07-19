import type { GameData } from "shared";

interface LinkedinGamesWorker {
	solveGame: () => Promise<boolean>;
	getResult(date?: string | undefined): Promise<GameData>;
}

export type { LinkedinGamesWorker };
