import type { Route } from "./+types/migrate";
import { env } from "cloudflare:workers";
import { useCallback } from "react";
import { useFetcher } from "react-router";

type MigrationResult = {
	error: boolean;
	message: string;
};

export async function action(_: Route.ComponentProps): Promise<MigrationResult> {
	try {
		using result = await env.DB.RollbackMigration();
		if (result.error) {
			return { error: true, message: result.error };
		}
		return {
			error: false,
			message: result.data ?? "Rollback didn't fail but didn't return a message.",
		};
	} catch (error) {
		console.error("Error calling RPC:", error);
		return { error: true, message: "Rollback failed." };
	}
}

export function useRollbackButton() {
	const fetcher = useFetcher<typeof action>();
	const pending = fetcher.state !== "idle";
	const error = pending ? false : (fetcher.data?.error ?? false);
	const message = pending ? "" : (fetcher.data?.message ?? "");

	const handleClick = useCallback(() => {
		fetcher.submit(null, { method: "post", action: "/db/rollback" });
	}, [fetcher]);

	return {
		error,
		message,
		Button: () => (
			<div className="px-2 py-1 outline rounded max-w-fit">
				<button type="button" disabled={pending} onClick={handleClick}>
					{pending ? "Running..." : "Rollback Last Migration"}
				</button>
			</div>
		),
	};
}
