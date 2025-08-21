import { useSubmit } from "react-router";
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

export async function action({ context }: Route.ActionArgs) {
	try {
		console.log("Action triggered, calling scheduled handler...");
		const queens = context.cloudflare.env.QUEENS;
		const res = await queens.scheduledHandler();
		console.log(res);
		return { result: res };
	} catch (error) {
		console.error("Error occurred while processing action:", error);
		throw error;
	}
}

export default function Home({ actionData: data }: Route.ComponentProps) {
	const submit = useSubmit();

	const handleSubmit = () => {
		console.log("submitting...");
		submit(
			{},
			{
				method: "post",
			},
		);
	};

	return (
		<div>
			<button type="button" onClick={handleSubmit}>
				Re-run queens
			</button>
			<p>{data ? JSON.stringify(data) : "Waiting..."}</p>
		</div>
	);
}
