import { redirect } from "react-router";
import type { Route } from "./+types/content";

export function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	url.pathname = url.pathname.replace("/content", "");

	if (url.pathname === "/") {
		return redirect("/404");
	}

	const newUrl = new URL(`https://connorbray.net${url.pathname + url.search}`);

	return context.cloudflare.env.CONTENT_MANAGER.fetch(newUrl);
}
