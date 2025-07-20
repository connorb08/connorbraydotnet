import logger from "#src/logger";
import type { RowId } from "../types";
import type { Cell } from "./cell";
import type { Color } from "./color";
import type { IVariable } from "./types";

// #region Types

interface IRow extends IVariable {
	readonly id: RowId;
	readonly cells: ReadonlySet<Cell>;

	addCell(cell: Cell): void;
}

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

export type { IRow };

// #endregion Types

class Row implements IRow {
	// #region Properties
	private readonly _id: RowId;
	private readonly _cells: Set<Cell> = new Set();
	// #endregion Properties

	// #region Domain
	private _queen: Cell | null = null;
	// #endregion Domain

	public constructor(id: number) {
		this._id = id as RowId;
	}

	public get id(): RowId {
		return this._id;
	}

	public get cells(): ReadonlySet<Cell> {
		return this._cells;
	}

	// #region Methods

	public addCell(cell: Cell): void {
		if (this._cells.has(cell)) {
			throw new Error(`Cell ${cell.id} already exists in color ${this._id}.`);
		}
		this._cells.add(cell);
	}

	private filter(filterFunction: (cell: Cell) => boolean): void {
		for (const cell of this._cells) {
			if (!filterFunction(cell)) {
				this._cells.delete(cell);
				cell.propagateConstraints({ isQueen: false });
			}
		}
	}
	// #endregion Methods

	public propagateConstraints({ color }: ColorConstraint): void;
	public propagateConstraints({ notColor }: NotColorConstraint): void;
	public propagateConstraints({ queen }: QueenConstraint): void;
	public propagateConstraints({
		color,
		queen,
		notColor,
	}: PropagateConstraintsParams): void {
		if (color) {
			this.filter((cell) => cell.color === color);
			this.localSearch();
		}

		if (notColor) {
			this.filter((cell) => cell.color !== notColor);
			this.localSearch();
		}

		if (queen) {
			this._queen ??= queen;
			for (const cell of this._cells) {
				if (cell === this._queen) {
					cell.propagateConstraints({ isQueen: true });
				} else {
					cell.propagateConstraints({ isQueen: false });
				}
			}
			this._cells.clear();
			return;
		}
		logger.warn("No queen or color provided for row constraints propagation.");
		return;
	}

	// #region Helper Methods

	private get queenPlaced(): boolean {
		return this._queen !== null;
	}

	private get cellCount(): number {
		return this._cells.size;
	}

	private invalidState(): boolean {
		const cellCount = this.cellCount;

		// If a queen is already placed, we should not have any remaining cells.
		if (this.queenPlaced) {
			if (cellCount > 0) {
				logger.error(
					`Row ${this._id} already has a queen placed at ${this._queen} but has ${cellCount} ${cellCount === 1 ? "cell" : "cells"} remaining.`,
				);
				return true;
			}
			return false;
		}

		if (cellCount === 0) {
			logger.error(`Row ${this._id} has no cells and no queen placed.`);
			return true;
		}

		return false;
	}

	// #endregion Helper Methods

	public localSearch(): void {
		const cellCount = this.cellCount;

		if (this.invalidState()) {
			return;
		}

		const colorSet = new Set<Color>();

		for (const cell of this._cells) {
			if (cellCount === 1) {
				this.propagateConstraints({ queen: cell });
				return;
			}
			colorSet.add(cell.color);
		}

		if (colorSet.size === 1) {
			const color = colorSet.values().next().value as Color;
			color.propagateConstraints({ row: this });
			return;
		}
	}
}

export { Row };
