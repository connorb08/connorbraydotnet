import type { JSONColumnType } from "kysely";

export type Definition = {
	GameId: string;

	/**
	 * Side-length of the square board (e.g. 8 for an 8x8 board)
	 */
	SideLength: number;

	/**
	 * Index: Cell Id
	 * Value: Cell Color Id
	 */
	CellColors: JSONColumnType<
		{
			cellId: number;
			colorId: number;
		}[]
	>;

	/**
	 * Index: Color Id
	 * Value: Color Hex Code
	 */
	ColorDefinitions: JSONColumnType<
		{
			Id: number;
			Name: string;
			RGB: string;
		}[]
	>;
};
