import { env } from "cloudflare:workers";
import { createCookieSessionStorage, type SessionData } from "react-router";
import type { SessionFlashData } from "#utils/state/index";

const { getSession, commitSession, destroySession } = createCookieSessionStorage<
    SessionData,
    SessionFlashData
>({
    cookie: {
        name: "__session",
        domain: process.env.NODE_ENV === "development" ? undefined : "connorbray.net",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secrets: [env.COOKIE_SECRET],
        secure: process.env.NODE_ENV === "production",
    },
});

export { getSession, commitSession, destroySession };
