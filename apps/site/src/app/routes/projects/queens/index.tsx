import { QueensResult } from "components";
import type { GameData } from "shared";
import type { Route } from "./+types";

export async function loader({ context }: Route.LoaderArgs) {
	const gameData: GameData = await context.cloudflare.env.API.queensResult();
	console.log("Queens game data:", gameData);
	return { data: gameData };
}

export default function ({ loaderData }: Route.ComponentProps) {
	const { data } = loaderData;
	return <QueensResult gameData={data} />;
}
