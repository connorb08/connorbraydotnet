import type { Cell } from "./cell";
import type { Color } from "./color";

interface IVariable {
	// Methods
	filter(filterFunction: (cell: Cell) => boolean): void;
	localSearch(): void;
}

export type { IVariable };

type ColorConstraint = {
	color: Color;
	queen?: never;
	notColor?: never;
};

type NotColorConstraint = {
	notColor: Color;
	color?: never;
	queen?: never;
};

type QueenConstraint = {
	color?: never;
	queen: Cell;
	notColor?: never;
};

type PropagateConstraintsParams =
	| ColorConstraint
	| QueenConstraint
	| NotColorConstraint;

export type {
	PropagateConstraintsParams,
	ColorConstraint,
	NotColorConstraint,
	QueenConstraint,
};
