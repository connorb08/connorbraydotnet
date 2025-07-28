import type { Route } from "./+types/index";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "Linkedin Games Solutions" },
		{ name: "description", content: "Solutions for daily linkedin games" },
	];
}

export function loader(_: Route.LoaderArgs) {
	return {};
}

export default function Home(_: Route.ComponentProps) {
	return "Index";
}
