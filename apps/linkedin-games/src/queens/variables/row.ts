import logger from "#src/logger";
import type { Color } from "./color";
import { VariableSet } from "./common";

class Row extends VariableSet {
	protected search(): boolean {
		const colorSet = new Set<Color>();

		for (const cell of this._cells) {
			colorSet.add(cell.color);
		}

		const [color] = colorSet;
		if (colorSet.size === 1 && color) {
			logger.trace(
				`Row ${this._id} only has one color left. Removing cells of color ${color.id} in other rows.`,
			);
			color.filter((cell) => cell.row === this);
			return true;
		}
		return false;
	}
}

export { Row };
