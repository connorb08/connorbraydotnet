import { useRef } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";
import type { Route } from "./+types/root";
import "#styles/App.scss";
import { ContextProvider } from "../utils/state/context";
import { getSession } from "./sessions.server";

export const links: Route.LinksFunction = () => [
	{
		rel: "preload",
		as: "font",
		href: "/fonts/ibm-plex-mono-v20-latin-regular.woff2",
		type: "font/woff2",
		crossOrigin: "anonymous",
	},
	{
		rel: "preload",
		as: "font",
		href: "/fonts/rajdhani-v17-latin-regular.woff2",
		type: "font/woff2",
		crossOrigin: "anonymous",
	},
];

export const meta: Route.MetaFunction = () => {
	return [{ title: "Connor Bray" }, { name: "description", content: "connorbray.net" }];
};

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	const theme = session.get("theme");
	const fullscreen = session.get("fullscreen");

	return {
		theme: theme ?? "light",
		fullscreen: fullscreen ?? false,
	};
}

export function Layout({ children }: { children: React.ReactNode }) {
	const rootRef = useRef<HTMLHtmlElement>(null);
	const data = useLoaderData<typeof loader>();

	return (
		<html
			lang="en"
			ref={rootRef}
			data-theme={data.theme ?? "light"}
			data-fullscreen={data.fullscreen ? true : null}
		>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<script src="/head.js" />
			</head>
			<body>
				<ContextProvider
					rootRef={rootRef}
					fullscreen={data.fullscreen ?? false}
					theme={data.theme ?? "light"}
				>
					{children}
				</ContextProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error: _ }: Route.ErrorBoundaryProps) {
	return <main>Error</main>;
}
