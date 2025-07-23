// #region VariableSet

import logger from "#src/logger";
import type { ICell } from "./cell";

interface IVariableSet {
	// Getters
	get id(): number;
	get cells(): ReadonlySet<ICell>;

	// Setters
	set queen(cell: ICell);

	// Methods
	addCell(cell: ICell): void;
	localSearch(): boolean;
}

abstract class VariableSet implements IVariableSet {
	// #region Constructor
	public constructor(id: number) {
		this._id = id;
	}
	// #endregion Constructor

	// #region Protected Fields
	protected readonly _id: number;
	protected readonly _cells: Set<ICell> = new Set<ICell>();
	protected _queen: ICell | null = null;
	// #endregion Protected Fields

	// #region Public Getters
	public get id(): number {
		return this._id;
	}

	public get cells(): ReadonlySet<ICell> {
		return this._cells;
	}
	// #endregion Public Getters

	// #region Public Setters
	public set queen(cell: ICell) {
		this._queen = cell;
		for (const c of this._cells) {
			if (c !== cell) {
				c.placeCross();
			}
		}
		this._cells.clear();
	}
	// #endregion Public Setters

	// #region Public Methods
	public addCell(cell: ICell): void {
		if (this._cells.has(cell)) {
			throw new Error(`Cell ${cell.id} already exists in color ${this._id}.`);
		}
		this._cells.add(cell);
	}

	public filter(filterFunction: (cell: ICell) => boolean): void {
		for (const cell of this._cells) {
			if (!filterFunction(cell)) {
				this._cells.delete(cell);
				cell.placeCross();
			}
		}
	}

	protected abstract search(): boolean;

	public localSearch(): boolean {
		if (this.invalidState()) {
			return false;
		}

		const [firstCell] = this._cells;

		/**
		 * Place queen on last cell if only one cell remains
		 */
		if (this._cells.size === 1 && firstCell) {
			this._queen = firstCell;
			firstCell.placeQueen();
			return true;
		}

		// Create a set of edges that are shared by all cells in a variable set.
		// Any common edges must have a cross placed on them.
		let sharedEdges = new Set<ICell>(firstCell?.edges);
		for (const cell of this._cells) {
			sharedEdges = sharedEdges.intersection(cell.edges);
		}

		// Place crosses on all shared edges.
		for (const cell of sharedEdges) {
			cell.placeCross();
			return true;
		}

		return this.search();
	}
	// #endregion Public Methods

	// #region Protected Getters
	protected get queenPlaced(): boolean {
		return this._queen !== null;
	}

	protected get cellCount(): number {
		return this._cells.size;
	}
	// #endregion Protected Getters

	// #region Protected Methods
	protected invalidState(): boolean {
		const cellCount = this.cellCount;

		// If a queen is already placed, we should not have any remaining cells.
		if (this.queenPlaced) {
			if (cellCount > 0) {
				logger.error(
					`Column ${this._id} already has a queen placed at ${this._queen} but has ${cellCount} ${cellCount === 1 ? "cell" : "cells"} remaining.`,
				);
				return true;
			}
			return false;
		}

		if (cellCount === 0) {
			logger.error(`Column ${this._id} has no cells and no queen placed.`);
			return true;
		}

		return false;
	}
	// #endregion Protected Methods
}

// #endregion VariableSet

export { VariableSet };
