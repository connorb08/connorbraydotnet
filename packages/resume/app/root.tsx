import { isRouteErrorResponse, Links, Outlet, Scripts } from "react-router";

import type { Route } from "./+types/root";
import "./styles/main.scss";

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Connor Bray Resume</title>
				<meta name="description" content="Connor Bray Resume" />
				<Links />
			</head>
			<body>
				<main>{children}</main>
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	if (isRouteErrorResponse(error)) {
		return (
			<>
				<h1>{`${error.status}: ${error.statusText}`}</h1>
				<p>{error.data}</p>
			</>
		);
	}
	if (error instanceof Error) {
		return <h1>500: Internal Server Error</h1>;
	}
	return (
		<>
			<h1>500: Internal Server Error</h1>
			<p>Unknown Error</p>
		</>
	);
}
