import { useRef } from "react";
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";
import { ProjectContext } from "#utils/context";
import type { Route } from "./+types/root";

/**
 * Import stylesheets.
 * App.scss - Global styles
 */
import "#styles/App.scss";

export const links: Route.LinksFunction = () => [];

export const meta: Route.MetaFunction = () => {
	return [
		{ title: "Connor Bray" },
		{ name: "description", content: "connorbray.net" },
	];
};

export function Layout({ children }: { children: React.ReactNode }) {
	const rootRef = useRef<HTMLHtmlElement>(null);

	return (
		<html lang="en" ref={rootRef}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<script src="/theme.js" />
			</head>
			<body>
				<ProjectContext.Provider value={{ rootRef }}>
					{children}
				</ProjectContext.Provider>
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
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
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
