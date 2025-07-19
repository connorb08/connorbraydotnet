import type { GameData } from "shared";
import logger from "#logger";
import { Cell } from "../variables/cell";
import { Color } from "../variables/color";
import { Column } from "../variables/column";
import { Row } from "../variables/row";

class Graph implements IGraph {
	// #region Properties
	private readonly _cells: Set<Cell> = new Set();
	private readonly _colors: Set<Color> = new Set();
	private readonly _rows: Set<Row> = new Set();
	private readonly _columns: Set<Column> = new Set();
	// #endregion Properties

	private _solution: GameData | null = null;
	private _sideLength = -1;

	// #region Constructor
	public constructor() {
		return;
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
	public get sideLength(): number {
		return this._sideLength;
	}
	// #endregion Getters

	// #region Setters

	public set sideLength(value: number) {
		if (value <= 0) {
			throw new Error("Side length must be a positive integer.");
		}
		this._sideLength = value;
	}

	// #endregion Setters

	// #region Methods

	private _getRow(rowId: number): Row {
		for (const row of this._rows) {
			if (row.id === rowId) {
				return row;
			}
		}
		const row = new Row(rowId);
		this._rows.add(row);
		return row;
	}

	private _getColumn(columnId: number): Column {
		for (const column of this._columns) {
			if (column.id === columnId) {
				return column;
			}
		}
		const column = new Column(columnId);
		this._columns.add(column);
		return column;
	}

	private _getColor(colorId: number, colorName: string, hex: string): Color {
		for (const color of this._colors) {
			if (color.id === colorId) {
				return color;
			}
		}
		const color = new Color({ id: colorId, name: colorName, hex });
		this._colors.add(color);
		return color;
	}
	public addCell({
		id,
		rowId,
		columnId,
		colorInfo,
	}: {
		id: number;
		rowId: number;
		columnId: number;
		colorInfo: { id: number; name: string; hex: string };
	}): void {
		logger.trace("Adding cell", { id, rowId, columnId, colorInfo });
		const row = this._getRow(rowId);
		const column = this._getColumn(columnId);
		const color = this._getColor(colorInfo.id, colorInfo.name, colorInfo.hex);
		const cell = new Cell({
			id,
			row,
			column,
			color,
		});
		this._cells.add(cell);
	}

	public createEdges(): void {
		logger.trace("Creating edges for cells");
		for (const cell of this._cells) {
			cell.row.addCell(cell);
			cell.column.addCell(cell);
			cell.color.addCell(cell);
		}
	}
	// #region Methods

	public get solution(): GameData | null {
		return this._solution;
	}

	public findSolution(): GameData {
		for (let i = 0; i < 1000; i++) {
			for (const color of this._colors) {
				color.localSearch();
			}
		}

		for (const row of this._rows) {
			row.localSearch();
		}

		for (const column of this._columns) {
			column.localSearch();
		}

		for (const cell of this._cells) {
			cell.localSearch();
		}

		logger.trace("Cells after local search", {
			cells: Array.from(this._cells).map((cell) => ({
				id: cell.id,
				row: cell.row.id,
				column: cell.column.id,
				color: cell.color.id,
			})),
		});

		for (const color of this._colors) {
			logger.trace("Color", {
				id: color.id,
				name: color.name,
				hex: color.hex,
				queen: color.queen,
			});
		}

		return this._solution as GameData;
	}
}

export { Graph };

// #region Types

interface IGraph {
	readonly rows: ReadonlySet<Row>;
	readonly columns: ReadonlySet<Column>;
	readonly cells: ReadonlySet<Cell>;
	readonly colors: ReadonlySet<Color>;

	// Setters
	sideLength: number;

	//
	findSolution(): void;

	// Methods
	createEdges(): void;
	addCell({
		id,
		rowId,
		columnId,
		colorInfo,
	}: {
		id: number;
		rowId: number;
		columnId: number;
		colorInfo: { id: number; name: string; hex: string };
	}): void;
}

// #endregion Types

export type { IGraph };
