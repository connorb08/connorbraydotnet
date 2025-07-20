import logger from "#src/logger";
import type { ColorId } from "../types";
import type { Cell } from "./cell";
import type { Column } from "./column";
import type { Row } from "./row";
import type { IVariable } from "./types";

class Color implements IColor {
	// #region Properties
	private readonly _id: ColorId;
	private readonly _name: string;
	private readonly _hex: string;
	// #endregion Properties

	private readonly _cells: Set<Cell> = new Set();

	// #region Domain
	private _queen: Cell | null = null;
	// #endregion Domain

	// #region Constructor

	public constructor({
		id,
		name,
		hex,
	}: { id: number; name: string; hex: string }) {
		this._id = id as ColorId;
		this._name = name;
		this._hex = hex;
	}

	public get id(): ColorId {
		return this._id;
	}

	public get name(): string {
		return this._name;
	}

	public get hex(): string {
		return this._hex;
	}

	public get rows(): ReadonlySet<Row> {
		const rows: Set<Row> = new Set();
		for (const cell of this._cells) {
			rows.add(cell.row);
		}
		return rows;
	}

	public get columns(): ReadonlySet<Column> {
		const columns: Set<Column> = new Set();
		for (const cell of this._cells) {
			columns.add(cell.column);
		}
		return columns;
	}

	public get queen(): Cell | null {
		if (this._queen === null) {
			logger.warn(`Color ${this._id} does not have a queen placed.`);
		}
		return this._queen;
	}

	public addCell(cell: Cell): void {
		if (this._cells.has(cell)) {
			throw new Error(`Cell ${cell.id} already exists in color ${this._id}.`);
		}
		this._cells.add(cell);
	}

	public localSearch(): void {
		// if (this._queen !== null) {
		// 	throw new Error(
		// 		`Color ${this._id} already has constraint satisfied by queen ${this._queen}.`,
		// 	);
		// }
		// if (this._cells.size === 0) {
		// 	throw new Error(`Color ${this._id} doesn't have any cells.`);
		// }
		// /**
		//  * If there is only one cell, we can place the queen there
		//  * and remove all other cells of this color
		//  */
		// if (this._cells.size === 1) {
		// 	const cell = this._cells.values().next()?.value;
		// 	if (!cell?.id) {
		// 		throw new Error(
		// 			`Error getting value of last cell in color ${this._id}.`,
		// 		);
		// 	}
		// 	this._queen = cell.id;
		// 	cell.propagateConstraints({ isQueen: true });
		// 	return;
		// }
		// /**
		//  * All cells of this color are in the same row
		//  * We can remove all cells in this row that are a different color
		//  */
		// if (this.rows.size === 1) {
		// 	this.rows.values().next()?.value?.propagateConstraints({
		// 		color: this,
		// 	});
		// }
		// /**
		//  * All cells of this color are in the same column
		//  * We can remove all cells in this column that are a different color
		//  */
		// if (this.columns.size === 1) {
		// 	this.columns.values().next()?.value?.propagateConstraints({
		// 		color: this,
		// 	});
		// }
		// for (const column of this.columns) {
		// 	if (column.cells.isSubsetOf(this._cells)) {
		// 		// all cells in this column are of this color, remove cells in other columns
		// 		for (const cell of this._cells) {
		// 			if (cell.column !== column) {
		// 				cell.propagateConstraints({ isQueen: false });
		// 			}
		// 		}
		// 	}
		// }
		// for (const row of this.rows) {
		// 	if (row.cells.isSubsetOf(this._cells)) {
		// 		// all cells in this row are of this color, remove cells in other rows
		// 		for (const cell of this._cells) {
		// 			if (cell.row !== row) {
		// 				cell.propagateConstraints({ isQueen: false });
		// 			}
		// 		}
		// 	}
		// }
	}

	public propagateConstraints({
		queen,
		row,
	}: {
		queen?: Cell;
		row?: Row;
	}): void {
		if (queen) {
			if (this._queen !== null) {
				throw new Error(
					`Color ${this._id} already has a queen placed at ${this._queen}.`,
				);
			}
			this._queen = queen;
			for (const cell of this._cells) {
				if (cell === queen) {
					cell.propagateConstraints({ isQueen: true });
				} else {
					cell.propagateConstraints({ isQueen: false });
				}
			}
			return;
		}
		if (row) {
			for (const r of this.rows) {
				if (r === row) {
					r.propagateConstraints({
						color: this,
					});
				} else {
					r.propagateConstraints({
						notColor: this,
					});
				}
			}
			return;
		}
	}
}

export { Color };

// #region Types

interface IColor extends IVariable {
	readonly id: ColorId;
	readonly name: string;
	readonly hex: string;
	readonly queen: Cell | null;

	addCell(cell: Cell): void;
}

export type { IColor };

// #endregion Types
