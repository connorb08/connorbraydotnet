import type { Route } from "./+types/home";
import { useMigrationButton } from "./db/migrate";
// import RunMigrationButton from "./db/migrate";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export default function Home(_: Route.ComponentProps) {
	const { Button, error, message } = useMigrationButton();
	return (
		<main className="flex flex-col items-center justify-center gap-4 pt-16">
			<div>hello</div>
			<Button />
			<p className={error ? "text-red-500" : "text-green-500"}>
				{message ? (error ? `Error: ${message}` : `Success: ${message}`) : ""}
			</p>
		</main>
	);
}
