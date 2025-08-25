import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export function loader({ context: _ }: Route.LoaderArgs) {
	return {};
}

export default function Home(_: Route.ComponentProps) {
	return <div>hello</div>;
}
