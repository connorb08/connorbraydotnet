import { data } from "react-router";
import { commitSession, getSession } from "#app/sessions.server";
import type { Route } from "./+types/_session";

export async function action({ request }: Route.ActionArgs) {
    const session = await getSession(request.headers.get("Cookie"));

    const formData = await request.formData();
    const theme = formData.get("theme");
    const fullscreen = formData.get("fullscreen");

    if (theme === "light" || theme === "dark") {
        session.set("theme", theme);
    }

    if (fullscreen === "true" || fullscreen === "false") {
        session.set("fullscreen", fullscreen === "true");
    }

    console.log(session.get("theme"));

    return data(
        { error: session.get("error") },
        {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        },
    );
}
