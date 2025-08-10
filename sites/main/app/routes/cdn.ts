import { redirect } from "react-router";
import type { Route } from "./+types/cdn";

const allowedReferers = ["https://connorbray.net", "127.0.0.1"];
function forbiddenReferer(request: Request): boolean {
	const referer = request.headers.get("Referer");

	if (referer && !allowedReferers.some((allowed) => referer.includes(allowed))) {
		return true;
	}
	return false;
}

export function loader({ request, context }: Route.LoaderArgs) {
	if (forbiddenReferer(request)) {
		return new Response("Forbidden", { status: 403 });
	}

	const url = new URL(request.url);
	url.pathname = url.pathname.replace("/cdn", "");

	if (url.pathname === "/") {
		return redirect("/404");
	}

	const newUrl = new URL(`https://connorbray.net${url.pathname + url.search}`);

	return context.cloudflare.env.CONTENT_MANAGER.fetch(newUrl);
}
