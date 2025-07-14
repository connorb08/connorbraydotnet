import type { CellId, ColorId } from "../types";

class Color {
	// #region Properties
	private readonly _id: ColorId;
	private readonly _name: string;
	private readonly _hex: string;
	// #endregion Properties

	// #region Domain
	private readonly _queen: CellId | null = null;
	// #endregion Domain

	// #region Constructor

	public constructor({
		id,
		name,
		hex,
	}: { id: ColorId; name: string; hex: string }) {
		this._id = id;
		this._name = name;
		this._hex = hex;
	}

	public get id(): ColorId {
		return this._id;
	}

	public get name(): string {
		return this._name;
	}

	public get hex(): string {
		return this._hex;
	}
}

export { Color };

// #region Types

interface IColor {
	readonly id: ColorId;
	readonly name: string;
	readonly hex: string;
}

export type { IColor };

// #endregion Types
