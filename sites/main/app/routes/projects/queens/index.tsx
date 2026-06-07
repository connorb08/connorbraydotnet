import { QueensGrid } from "components";
import type { GameData } from "shared";
import { cfContext } from "#app/context";
import type { Route } from "./+types";

export async function loader({ context }: Route.LoaderArgs) {
	try {
		using data = await context.get(cfContext).env.DB.GetQueens();
		return { data, error: undefined };
	} catch (error) {
		console.error("Error fetching queens:", error);
		return { data: undefined, error: "Error" };
	}
}

const _gameData: GameData = {
	sideLength: 9,
	colors: [
		"rgb(187, 163, 226)",
		"rgb(255, 201, 146)",
		"rgb(150, 190, 255)",
		"rgb(179, 223, 160)",
		"rgb(223, 223, 223)",
		"rgb(255, 123, 96)",
		"rgb(230, 243, 136)",
		"rgb(185, 178, 158)",
		"rgb(223, 160, 191)",
	],
	cellColors: [
		5, 5, 5, 5, 1, 2, 2, 2, 2, 5, 5, 5, 5, 1, 3, 3, 2, 2, 5, 5, 4, 5, 1, 3, 3, 3, 2, 5, 0,
		4, 4, 1, 3, 6, 3, 2, 5, 0, 0, 4, 1, 6, 6, 6, 2, 5, 7, 0, 4, 1, 8, 2, 2, 2, 5, 7, 7, 7,
		1, 8, 8, 2, 2, 5, 5, 5, 5, 1, 8, 8, 8, 2, 5, 5, 5, 5, 1, 8, 8, 8, 8,
	],
	cellsRemoved: [
		1, 2, 3, 10, 11, 12, 19, 21, 64, 65, 66, 73, 74, 75, 38, 29, 46, 55, 47, 36, 27, 51,
		48, 54, 58, 59, 60, 61, 62, 30, 31, 32, 34, 35, 39, 40, 44, 56, 49, 67, 18, 22, 23,
		24, 25, 26, 28, 41, 42, 43, 45, 6, 15, 69, 78, 9, 13, 16, 17, 5, 50, 68, 77, 4, 71, 7,
		8, 72, 79, 80, 52, 63,
	],
	queenPositions: [57, 20, 37, 33, 14, 76, 53, 70, 0],
};

export default function ({ loaderData }: Route.ComponentProps) {
	const { data, error } = loaderData;

	if (error || !data) {
		return "Error";
	}

	const cellColors = Array.isArray(data.CellColors)
		? data.CellColors.reduce<number[]>((acc, cell) => {
			acc[cell.CellId] = cell.ColorId;
			return acc;
		}, [])
		: [];

	// if (data.error) {
	// 	return "Error";
	// }
	// const solution = data.solutionData?.solution;
	// if (!solution) {
	// 	return "No solution found";
	// }
	return (
		<QueensGrid
			cellColors={cellColors}
			colors={data.Colors.map((v) => ({ id: v.Id, rgb: v.RGB, name: v.Name }))}
			queenPositions={data.Queens}
			sideLength={data.SideLength}
			cellsRemoved={data.Removed}
		/>
	);
}
