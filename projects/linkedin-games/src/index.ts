import { serve } from "bun";
import PlayQueens from "./queens/index.ts";
import PageController from "./queens/page-controller.ts";

serve({
	port: 3000,
	async fetch(req) {
		await using pageController = await PageController();
		const queenLocations = await PlayQueens({ pageController });
		return new Response(JSON.stringify(queenLocations), {
			headers: {
				"Content-Type": "application/json",
			},
		});
	},
	async error(error) {
		if (Error.isError(error)) {
			console.error(error);
			return new Response(`Error: ${error.message}`, {
				status: 500,
			});
		}

		console.error("Unknown error:", error);
		return new Response("Unknown error occurred", {
			status: 500,
		});
	},
});

// console.log("Server is running on http://localhost:3000");
// export async function main() {
// 	await using pageController = await PageController();
// 	const queenLocations = await PlayQueens({ pageController });
// 	console.log("Queen locations:", queenLocations);
// }

// if (import.meta.main) {
// 	main();
// }
