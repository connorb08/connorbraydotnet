import type { SessionFlashData } from "#utils/session";
import type { SessionData } from "react-router";
import { env } from "cloudflare:workers";
import process from "node:process";
import { createCookieSessionStorage } from "react-router";

const isProduction = process.env.NODE_ENV === "production";

const { getSession, commitSession, destroySession } = createCookieSessionStorage<
	SessionData,
	SessionFlashData
>({
	cookie: {
		domain: isProduction ? "connorbray.net" : undefined,
		name: "__session",
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		secrets: [env.COOKIE_SECRET],
		secure: isProduction,
	},
});

export { commitSession, destroySession, getSession };
