import logger from "#logger";
import type { Cell } from "../variables/cell";
import type { Color } from "../variables/color";
import type { Column } from "../variables/column";
import type { Row } from "../variables/row";

class Graph implements IGraph {
	// #region Properties
	private readonly _cells: Set<Cell> = new Set();
	private readonly _colors: Set<Color> = new Set();
	private readonly _rows: Set<Row> = new Set();
	private readonly _columns: Set<Column> = new Set();
	// #endregion Properties

	// #region Constructor
	public constructor() {
		logger.debug("Graph.constructor");
	}
	// #endregion Constructor

	// #region Getters
	public get rows(): ReadonlySet<Row> {
		return this._rows;
	}

	public get columns(): ReadonlySet<Column> {
		return this._columns;
	}
	public get cells(): ReadonlySet<Cell> {
		return this._cells;
	}
	public get colors(): ReadonlySet<Color> {
		return this._colors;
	}
	// #endregion Getters
}

export { Graph };

// #region Types

interface IGraph {
	readonly rows: ReadonlySet<Row>;
	readonly columns: ReadonlySet<Column>;
	readonly cells: ReadonlySet<Cell>;
	readonly colors: ReadonlySet<Color>;
}

// #endregion Types

export type { IGraph };
