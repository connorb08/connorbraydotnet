import { createCookieSessionStorage, type SessionData } from "react-router";
import type { SessionFlashData } from "#utils/state/index";

const { getSession, commitSession, destroySession } = createCookieSessionStorage<
    SessionData,
    SessionFlashData
>({
    cookie: {
        name: "__session",
        domain: process.env.NODE_ENV === "development" ? undefined : "example.com",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secrets: ["s3cret1"],
        secure: process.env.NODE_ENV === "production",
    },
});

export { getSession, commitSession, destroySession };
