import logger from "#src/logger";
import type { CellId } from "../types";
import type { Color } from "./color";
import type { Column } from "./column";
import type { Row } from "./row";
import type { IVariable } from "./types";

// #region Types

interface ICell extends IVariable {
	readonly id: CellId;
	readonly row: Row;
	readonly column: Column;
	readonly color: Color;
	readonly edges: ReadonlySet<ICell>;

	placeQueen(): void;
	placeCross(): void;
}

export type { ICell };

// #endregion Types

class Cell implements ICell {
	// #region Properties
	readonly #corners: Set<ICell> = new Set();
	private readonly _id: CellId;
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

	public get edges(): ReadonlySet<ICell> {
		return new Set<ICell>()
			.union(this.#corners)
			.union(this._row.cells)
			.union(this._column.cells);
	}

	public get isQueen(): boolean | null {
		return this._isQueen;
	}

	public addCorner(corner: Cell): void {
		if (this.#corners.has(corner)) {
			logger.warn(`Corner ${corner.id} already exists for cell ${this._id}.`);
		} else {
			this.#corners.add(corner);
			corner.#corners.add(this); // Ensure bidirectional corner
		}
	}

	public localSearch(): boolean {
		if (this.edges.size === 0) {
			this.placeQueen();
			return true;
		}
		return false;
	}

	public placeQueen(): void {
		logger.debug(`Placing queen at cell ${this._id}.`);
		this._isQueen = true;
		this._color.queen = this;
		this._row.queen = this;
		this._column.queen = this;
		for (const corner of this.#corners) {
			logger.trace(`Removing corner ${corner.id} from cell ${this._id}.`);
			corner.placeCross();
		}
	}

	public placeCross(): void {
		logger.debug(`Placing cross at cell ${this._id}.`);
		this._isQueen = false;
		this._color.filter((c) => c !== this);
		this._row.filter((c) => c !== this);
		this._column.filter((c) => c !== this);
		for (const corner of this.#corners) {
			corner.filter((c) => c !== this);
		}
	}

	public filter(filterFunction: (cell: Cell) => boolean): void {
		if (!filterFunction(this)) {
			this.placeCross();
		}
	}
}

export { Cell };
