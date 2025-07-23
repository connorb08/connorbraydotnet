import logger from "#src/logger";
import type { Column } from "./column";
import { VariableSet } from "./common";
import type { Row } from "./row";

class Color extends VariableSet {
	public constructor({
		id,
		name,
		hex,
	}: { id: number; name: string; hex: string }) {
		super(id);
		this._name = name;
		this._hex = hex;
	}

	// #region Properties
	private readonly _name: string;
	private readonly _hex: string;
	// #endregion Properties

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

	protected search(): boolean {
		/**
		 * All cells of this color are in the same row
		 * We can remove all cells in this row that are a different color
		 */
		const [row] = this.rows;
		if (this.rows.size === 1 && row) {
			logger.trace(
				`Row ${row.id} has only one color left. Removing cells of color ${this.id} in other rows.`,
			);
			row.filter((cell) => cell.color === this);
			return true;
		}
		/**
		 * All cells of this color are in the same column
		 * We can remove all cells in this column that are a different color
		 */
		if (this.columns.size === 1) {
			this.columns
				.values()
				.next()
				?.value?.filter((cell) => {
					return cell.color === this;
				});
			return true;
		}
		for (const column of this.columns) {
			if (column.cells.isSubsetOf(this._cells)) {
				// all cells in this column are of this color, remove cells in other columns
				for (const cell of this._cells) {
					cell.filter((c) => c.column === column);
					// if (cell.column !== column) {
					// 	cell.propagateConstraints({ isQueen: false });
					// }
				}
				return true;
			}
		}
		for (const row of this.rows) {
			if (row.cells.isSubsetOf(this._cells)) {
				// all cells in this row are of this color, remove cells in other rows
				for (const cell of this._cells) {
					cell.filter((c) => c.row === row);
				}
				return true;
			}
		}

		return false;
	}
}

export { Color };
