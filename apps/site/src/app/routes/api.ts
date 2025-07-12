import type { Route } from "./+types";

export async function loader({ context }: Route.LoaderArgs) {
	return await context.cloudflare.env.API.linkedinGames();
}
