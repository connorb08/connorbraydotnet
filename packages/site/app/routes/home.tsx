import type { Route } from "./+types/home";

export function meta() {
	return [
		{ title: "Connor Bray" },
		{ name: "description", content: "connorbray.net" },
	];
}

export function loader({ context }: Route.LoaderArgs) {
	return { message: "Hello World" };
}

export default function Home({ loaderData }: Route.ComponentProps) {
	return <>Home</>;
}
