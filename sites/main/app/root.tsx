import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import "#styles/App.scss";
import { FullscreenProvider, ThemeProvider } from "#utils/providers/index";
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
		theme: theme ?? null,
		fullscreen: fullscreen ?? false,
	};
}

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useLoaderData<typeof loader>();

	return (
		<html
			lang="en"
			data-theme={data.theme ?? null}
			data-fullscreen={data.fullscreen ? "" : null}
		>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<FullscreenProvider fullscreen={data.fullscreen ?? false}>
					<ThemeProvider theme={data.theme ?? null}>
						{children}
					</ThemeProvider>
				</FullscreenProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="r ptp16 container container">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="auto w-full w-full p-4 p-4">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
