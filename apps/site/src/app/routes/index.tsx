import Home from "#pages/home";
import type { Route } from "./+types/index";

export function meta() {
	return [
		{ title: "Connor Bray" },
		{ name: "description", content: "connorbray.net" },
	];
}

export function loader(_: Route.LoaderArgs) {
	return { message: "Hello World" };
}

export default function (_: Route.ComponentProps) {
	return <Home />;
}
