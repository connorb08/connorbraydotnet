import type { QueueMessage } from "../queue";

type ColorData = {
	id: number;
	name: string;
	rgb: string;
};

export type QueensStep = {
	analyzedCells: number[];
};

export type QueensSolution = {
	cellColors: number[];
	cellsRemoved: number[];
	colors: ColorData[];
	queenPositions: number[];
	sideLength: number;
};

export type CloudflareDTO = QueueMessage<{
	solution: QueensSolution;
	steps: QueensStep[];
}>;
