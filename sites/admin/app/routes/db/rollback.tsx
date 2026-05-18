import { env } from "cloudflare:workers";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/migrate";

type MigrationResult = {
	error: boolean;
	message: string;
};

export async function action(_: Route.ComponentProps): Promise<MigrationResult> {
	try {
		using result = await env.DB.RollbackLastMigration();
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
	const [pending, setPending] = useState(false);
	const [error, setError] = useState(false);
	const [message, setMessage] = useState("");

	const handleClick = () => {
		setPending(true);
		setError(false);
		setMessage("");
		fetcher.submit(null, { method: "post", action: "/db/rollback" });
	};

	useEffect(() => {
		if (fetcher.state === "idle") {
			setPending(false);
			setError(fetcher.data?.error ?? false);
			setMessage(fetcher.data?.message ?? "");
		}
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
