import type { CellId, ColumnId } from "../types";
import type { Cell } from "./cell";
import type { Color } from "./color";
import type { IVariable } from "./types";

class Column implements IColumn {
	// #region Properties
	private readonly _id: ColumnId;
	private readonly _cells: Set<Cell> = new Set();
	// #endregion Properties

	// #region Domain
	private _queen: CellId | null = null;
	// #endregion Domain

	public constructor(id: number) {
		this._id = id as ColumnId;
	}

	public get id(): ColumnId {
		return this._id;
	}

	public get cells(): ReadonlySet<Cell> {
		return this._cells;
	}

	// #region Private Methods
	private filter(filterFunction: (cell: Cell) => boolean): void {
		for (const cell of this._cells) {
			if (!filterFunction(cell)) {
				this._cells.delete(cell);
			}
		}
	}
	// #endregion Methods

	public addCell(cell: Cell): void {
		if (this._cells.has(cell)) {
			throw new Error(`Cell ${cell.id} already exists in color ${this._id}.`);
		}
		this._cells.add(cell);
	}

	public propagateConstraints({
		color,
		queenId,
	}: {
		color?: Color;
		queenId?: CellId;
	}): void {
		if (queenId) {
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

export { Column };

// #region Types

interface IColumn extends IVariable {
	readonly id: ColumnId;
	readonly cells: ReadonlySet<Cell>;

	addCell(cell: Cell): void;
}

export type { IColumn };

// #endregion Types
