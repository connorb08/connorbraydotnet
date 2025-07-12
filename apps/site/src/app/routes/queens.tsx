import { QueensResult } from "components";
import type { GameData } from "shared";
import type { Route } from "./+types/queens";

export function meta() {
	return [
		{ title: "Connor Bray" },
		{ name: "description", content: "connorbray.net" },
	];
}

export async function loader({ context }: Route.LoaderArgs) {
	const gameData: GameData = await context.cloudflare.env.API.linkedinGames();
	console.log("Queens game data:", gameData);
	return { data: gameData };
}

export default function ({ loaderData }: Route.ComponentProps) {
	const { data } = loaderData;
	return <QueensResult gameData={data} />;
}
