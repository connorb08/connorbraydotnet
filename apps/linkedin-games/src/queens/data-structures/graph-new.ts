import type { GameData } from "shared";
import logger from "#logger";
import type { CellId } from "../types";
import { Cell } from "../variables/cell";
import { Color } from "../variables/color";
import { Column } from "../variables/column";
import { Row } from "../variables/row";

class Graph implements IGraph {
	// #region Properties
	private readonly _cells: Set<Cell> = new Set();
	private readonly _cellMap: Map<CellId, Cell> = new Map();
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
		logger.trace("Creating new row", { rowId });
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
		logger.trace("Creating new column", { columnId });
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
		logger.trace("Creating new color", { colorId, colorName, hex });
		const color = new Color({ id: colorId, name: colorName, hex });
		this._colors.add(color);
		return color;
	}

	public print(): void {
		for (let rowId = 0; rowId < this._sideLength; rowId++) {
			const rowCellValues: string[] = [];
			for (let columnId = 0; columnId < this._sideLength; columnId++) {
				const cellId = rowId * this._sideLength + columnId;
				const cell = this._cellMap.get(cellId as CellId);
				if (cell) {
					if (cell.isQueen === null) {
						rowCellValues.push(cell.color.id.toString());
					} else if (cell.isQueen) {
						rowCellValues.push("Q");
					} else {
						rowCellValues.push("X");
					}
				}
			}
			console.log(rowCellValues);
		}
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
		logger.trace(`Adding cell ${id}`);
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
		row.addCell(cell);
		column.addCell(cell);
		color.addCell(cell);
		this._cellMap.set(id as CellId, cell);

		// Add diagonal edges to the top left and top right cells
		// creating an edge is bidirectional
		// bottom left and bottom right cells will also be connected on the next iteration
		if (rowId > 0 && columnId > 0) {
			const topLeftCellId = (rowId - 1) * this._sideLength + (columnId - 1);
			const topLeftCell = this._cellMap.get(topLeftCellId as CellId);
			if (topLeftCell) {
				cell.addCorner(topLeftCell);
			}
		}
		if (rowId > 0 && columnId < this._sideLength - 1) {
			const topRightCellId = (rowId - 1) * this._sideLength + (columnId + 1);
			const topRightCell = this._cellMap.get(topRightCellId as CellId);
			if (topRightCell) {
				cell.addCorner(topRightCell);
			}
		}
	}

	// #region Methods

	public get solution(): GameData | null {
		return this._solution;
	}

	public findSolution(): GameData {
		for (const row of this._rows) {
			row.localSearch();
		}

		for (const column of this._columns) {
			column.localSearch();
		}

		for (const color of this._colors) {
			color.localSearch();
		}

		for (const cell of this._cells) {
			cell.localSearch();
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

	// Methods
	print(): void;
	findSolution(): GameData;
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
