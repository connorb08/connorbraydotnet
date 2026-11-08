import type { Route } from "./+types/migrate";
import { env } from "cloudflare:workers";
import { useFetcher } from "react-router";

type MigrationResult = {
	error: boolean;
	message: string;
};

export async function action(_: Route.ComponentProps): Promise<MigrationResult> {
	try {
		using result = await env.DB.RunMigrations();
		if (result.error) {
			return { error: true, message: result.error };
		}
		return {
			error: false,
			message: result.data ?? "Migrations didn't fail but didn't return a message.",
		};
	} catch (error) {
		console.error("Error calling RPC:", error);
		return { error: true, message: "Migration failed." };
	}
}

export function useMigrationButton() {
	const fetcher = useFetcher<typeof action>();
	const pending = fetcher.state !== "idle";
	const error = pending ? false : (fetcher.data?.error ?? false);
	const message = pending ? "" : (fetcher.data?.message ?? "");

	const handleClick = () => {
		fetcher.submit(null, { method: "post", action: "/db/migrate" });
	};

	return {
		error,
		message,
		Button: () => (
			<div className="px-2 py-1 outline rounded max-w-fit">
				<button type="button" disabled={pending} onClick={handleClick}>
					{pending ? "Running..." : "Run Migration"}
				</button>
			</div>
		),
	};
}
