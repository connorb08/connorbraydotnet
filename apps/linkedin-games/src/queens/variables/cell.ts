import logger from "#src/logger";
import type { CellId } from "../types";
import type { Color } from "./color";
import type { Column } from "./column";
import type { Row } from "./row";
import type { IVariable } from "./types";

class Cell implements ICell {
	// #region Properties
	private readonly _id: CellId;
	private readonly _edges: Set<Cell> = new Set();
	private readonly _row: Row;
	private readonly _column: Column;
	private readonly _color: Color;
	// #endregion Properties

	// #region Domain
	private _isQueen: boolean | null = null;
	// #endregion Domain

	public constructor({
		id,
		row,
		column,
		color,
	}: { id: number; row: Row; column: Column; color: Color }) {
		this._id = id as CellId;
		this._row = row;
		this._column = column;
		this._color = color;
	}

	public get id(): CellId {
		return this._id;
	}

	public get row(): Row {
		return this._row;
	}

	public get column(): Column {
		return this._column;
	}

	public get color(): Color {
		return this._color;
	}

	public get edges(): ReadonlySet<Cell> {
		return this._edges;
	}

	public addEdge(edge: Cell): void {
		if (this._edges.has(edge)) {
			logger.warn(`Edge ${edge.id} already exists for cell ${this._id}.`);
		} else {
			this._edges.add(edge);
			edge.addEdge(this); // Ensure bidirectional edge
		}
	}

	public localSearch(): void {
		if (this._isQueen !== null) {
			logger.warn(
				`Cell ${this._id} already has constraint satisfied — isQueen: ${this._isQueen}.`,
			);
		}
		if (this._edges.size === 0) {
			this._isQueen = true;
			// this._column.propagateConstraints({ color: this._color });
			// this._row.propagateConstraints({ color: this._color });
			// this._color.localSearch();
			return;
		}
	}

	public propagateConstraints({ isQueen }: { isQueen: boolean }): void {
		if (this._isQueen !== null) {
			logger.warn(
				`Cell ${this._id} already has constraint satisfied — isQueen: ${this._isQueen}.`,
			);
		}
		this._isQueen = isQueen;
		if (isQueen) {
			this._column.propagateConstraints({
				queenId: this._id,
			});
			this._row.propagateConstraints({
				queen: this,
			});
			this._color.propagateConstraints({
				queen: this,
			});
			for (const edge of this._edges) {
				edge.propagateConstraints({ isQueen: false });
			}
		}
	}
}

export { Cell };

// #region Types

interface ICell extends IVariable {
	readonly id: CellId;
	readonly row: Row;
	readonly column: Column;
	readonly color: Color;
	readonly edges: ReadonlySet<Cell>;
	propagateConstraints({ isQueen }: { isQueen: boolean }): void;
}

export type { ICell };

// #endregion Types
