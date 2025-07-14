import type { CellId } from "../types";

class Cell implements ICell {
	// #region Properties
	private readonly _id: CellId;
	// #endregion Properties

	// #region Domain
	private readonly _isQueen: boolean | null = null;
	// #endregion Domain

	public constructor(id: number) {
		this._id = id as CellId;
	}

	public get id(): CellId {
		return this._id;
	}
}

export { Cell };

// #region Types

interface ICell {
	readonly id: CellId;
}

export type { ICell };

// #endregion Types
