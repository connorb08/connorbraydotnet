import { QueensGrid } from "components";
import { cfContext } from "#app/context";
import type { Route } from "./+types";

export async function loader({ context }: Route.LoaderArgs) {
	try {
		const data = await context.get(cfContext).env.DB.GetQueens();
		return { data, error: undefined };
	} catch (error) {
		console.error("Error fetching queens:", error);
		return { data: undefined, error: "Error" };
	}
}

export default function QueensRoute({ loaderData }: Route.ComponentProps) {
	const { data, error } = loaderData;

	if (error || !data) {
		return "Error";
	}

	return (
		<QueensGrid
			cellColors={data.CellColors}
			colors={data.Colors.map((v) => ({ id: v.Id, rgb: v.RGB, name: v.Name }))}
			queenPositions={data.Queens}
			sideLength={data.SideLength}
			cellsRemoved={data.Removed}
		/>
	);
}
