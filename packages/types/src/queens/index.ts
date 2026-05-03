import type { QueueMessage } from "../queue";

type ColorData = {
	id: number;
	name: string;
	rgb: string;
};

type CellUpdate = {
	id: number;
	isQueen: boolean;
	reason: string;
};

export type QueensStep = {
	didUpdate: boolean;
	analyzedCells: number[];
	description: string;
	updatedCells: CellUpdate[];
};

export type QueensGameDefinition = {
	sideLength: number;
	colors: ColorData[];
	cellColors: number[];
};

export type QueensSolution = {
	sideLength: number;
	colors: ColorData[];
	cellColors: number[];
	queenPositions: number[];
	cellsRemoved: number[];
};

export type CloudflareDTO = QueueMessage<{
	definition: QueensGameDefinition;
	solution: QueensSolution;
	steps: QueensStep[];
}>;
