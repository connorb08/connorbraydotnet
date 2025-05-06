import Home from "#components/Home";
import type { Route } from "./+types/index";

export function meta() {
	return [
		{ title: "Connor Bray" },
		{ name: "description", content: "connorbray.net" },
	];
}

export function loader({ context }: Route.LoaderArgs) {
	return { message: "Hello World" };
}

export default function ({ loaderData }: Route.ComponentProps) {
	return <Home />;
}
