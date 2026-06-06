import { redirect } from "react-router";
import type { Route } from "./+types/cdn";
import { cfContext } from "#app/context";

const allowedReferers = ["https://connorbray.net", "127.0.0.1"];
function forbiddenReferer(request: Request): boolean {
	const referer = request.headers.get("Referer");

	if (referer && !allowedReferers.some((allowed) => referer.includes(allowed))) {
		return true;
	}
	return false;
}

export function loader({ request, url, context }: Route.LoaderArgs) {
	if (forbiddenReferer(request)) {
		return new Response("Forbidden", { status: 403 });
	}

	const contentPath = new URL(url).pathname.replace("/cdn", "");

	if (contentPath === "/") {
		return redirect("/404");
	}

	const finalUrl = new URL(`https://connorbray.net${contentPath + new URL(url).search}`);
	const cloudflare = context.get(cfContext);

	return cloudflare.env.CONTENT_MANAGER.fetch(finalUrl);
}
