import type { CellId, RowId } from "../types";

class Row implements IRow {
	// #region Properties
	private readonly _id: RowId;
	// #endregion Properties

	// #region Domain
	private readonly _queen: CellId | null = null;
	// #endregion Domain

	public constructor(id: RowId) {
		this._id = id;
	}

	public get id(): RowId {
		return this._id;
	}
}

export { Row };

// #region Types

interface IRow {
	readonly id: RowId;
}

export type { IRow };

// #endregion Types
