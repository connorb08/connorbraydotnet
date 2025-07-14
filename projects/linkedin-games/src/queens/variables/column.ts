import type { CellId, ColumnId } from "../types";

class Column implements IColumn {
	// #region Properties
	private readonly _id: ColumnId;
	// #endregion Properties

	// #region Domain
	private readonly _queen: CellId | null = null;
	// #endregion Domain

	public constructor(id: ColumnId) {
		this._id = id;
	}

	public get id(): ColumnId {
		return this._id;
	}
}

export { Column };

// #region Types

interface IColumn {
	readonly id: ColumnId;
}

export type { IColumn };

// #endregion Types
