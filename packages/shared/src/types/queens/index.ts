export type QueensPuzzle = {
	sideLength: number;
	colors: string[];
	cellColors: number[];
};

export type QueensSolution = QueensPuzzle & {
	cellsRemoved: number[];
	queenPositions: number[];
};

export type QueensMove = {
	cellsInspected: number[];
	queenPlacedAt?: number | null;
	cellsRemoved: number[];
	description: string;
};

export type { QueensSolution as GameData };
