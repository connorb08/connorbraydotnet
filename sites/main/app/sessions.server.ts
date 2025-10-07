import { createCookieSessionStorage } from "react-router";

export type SessionData = {
    theme: "light" | "dark";
    fullscreen: boolean;
};

type SessionFlashData = {
    error: string;
};

const { getSession, commitSession, destroySession } =
    createCookieSessionStorage<SessionData, SessionFlashData>(
        {
            cookie: {
                name: "__session",
                domain: process.env.NODE_ENV === "development" ? undefined : "example.com",
                httpOnly: true,
                path: "/",
                sameSite: "lax",
                secrets: ["s3cret1"],
                secure: process.env.NODE_ENV === "production",
            },
        },
    );

export { getSession, commitSession, destroySession };
