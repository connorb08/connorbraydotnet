import type { GameData } from "#src/queens/types.ts";

interface LinkedinGamesWorker {
	getResult(date?: string | undefined): Promise<GameData>;
}

export type { LinkedinGamesWorker };
