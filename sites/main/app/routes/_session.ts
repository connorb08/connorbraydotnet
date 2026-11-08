import type { Route } from "./+types/_session";
import { commitSession, getSession } from "#app/sessions.server";
import { data } from "react-router";

export async function action({ request }: Route.ActionArgs) {
	const session = await getSession(request.headers.get("Cookie"));

	const formData = await request.formData();
	const theme = formData.get("theme");
	const fullscreen = formData.get("fullscreen");

	if (theme === "light" || theme === "dark") {
		session.set("theme", theme);
	}

	if (typeof fullscreen === "string") {
		const normalizedFullscreen = fullscreen.toLowerCase();
		if (normalizedFullscreen === "true" || normalizedFullscreen === "false") {
			session.set("fullscreen", normalizedFullscreen === "true");
		}
	}

	return data(
		{ error: session.get("error") },
		{
			headers: {
				"Set-Cookie": await commitSession(session),
			},
		},
	);
}
