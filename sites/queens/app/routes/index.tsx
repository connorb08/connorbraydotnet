import { logger } from "clog";
import Home from "../components/home";
import type { Route } from "./+types/index";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "Linkedin Games Solutions" },
		{ name: "description", content: "Solutions for daily linkedin games" },
	];
}

export async function loader({ context }: Route.LoaderArgs) {
	try {
		const { error, data } = await context.cloudflare.env.DATABASE.getQueens();
		if (error) {
			logger.error("Error fetching game data:", error);
			return { data: null };
		}
		return {
			data,
		};
	} catch (error) {
		logger.error("Error fetching game data:", error);
		return { data: null };
	}
}

export default function ({ loaderData }: Route.ComponentProps) {
	const { data } = loaderData;
	return data ? <Home solution={data.solution} /> : <div>No data available</div>;
}
