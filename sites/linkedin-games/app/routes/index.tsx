import { logger } from "clog";
import { QueensResult } from "components";
import type { GameData } from "shared";
import type { Route } from "./+types/index";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "Linkedin Games Solutions" },
		{ name: "description", content: "Solutions for daily linkedin games" },
	];
}

export async function loader({ context }: Route.LoaderArgs) {
	try {
		const storage = context.cloudflare.env.STORAGE.get(
			context.cloudflare.env.STORAGE.idFromName("default"),
		);
		const data: GameData = await storage.getQueenSolution();
		return { data };
	} catch (error) {
		logger.error("Error fetching game data:", error);
		return { data: null };
	}
}

export default function ({ loaderData }: Route.ComponentProps) {
	const { data } = loaderData;
	return data ? <QueensResult {...data} /> : <div>No data available</div>;
}
