import type { CellId, RowId } from "../types";
import type { Cell } from "./cell";
import type { Color } from "./color";

class Row implements IRow {
	// #region Properties
	private readonly _id: RowId;
	private readonly _cells: Set<Cell> = new Set();
	// #endregion Properties

	// #region Domain
	private _queen: CellId | null = null;
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
			}
		}
	}
	// #endregion Methods

	public propagateConstraints({
		color,
		queenId,
	}: {
		color?: Color;
		queenId?: CellId;
	}): void {
		if (queenId) {
			if (this._queen !== null) {
				throw new Error(
					`Row ${this._id} already has a queen placed at ${this._queen}.`,
				);
			}
			this._queen = queenId;
			for (const cell of this._cells) {
				if (cell.id === queenId) {
					cell.propagateConstraints({ isQueen: true });
				}
			}
		} else if (color) {
			this.filter((cell) => cell.color === color);
		}
	}

	public localSearch(): void {
		return;
	}
}

export { Row };

// #region Types

interface IRow {
	readonly id: RowId;
	readonly cells: ReadonlySet<Cell>;

	addCell(cell: Cell): void;
	localSearch(): void;
}

export type { IRow };

// #endregion Types
