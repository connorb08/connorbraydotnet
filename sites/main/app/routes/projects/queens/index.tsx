import { QueensGrid } from "components";
import type { Route } from "./+types";

// const projectData = {
// 	slug: "queens",
// 	name: "LinkedIn N-Queens Solver",
// 	description: "Automated solver for LinkedIn's Queens puzzle game",
// 	about: [
// 		"Implemented constraint propagation algorithm in TypeScript",
// 		"AWS Lambda function for automated serverless execution",
// 		"Cloudflare Workers Queue for publishing results",
// 		"Automated browser interaction using Playwright",
// 		"Achieves 100% success rate on all puzzle sizes",
// 	],
// 	technologies: ["TypeScript", "AWS Lambda", "Cloudflare Workers", "Playwright"],
// 	repositoryUrl: "https://github.com/connorb08/queens",
// 	liveUrl: "https://linkedin-games.win",
// 	images: [],
// 	challenges: [
// 		"Implementing an efficient constraint satisfaction algorithm for modified N-Queens puzzle",
// 		"Get daily puzzle info from Linkedin website",
// 	],
// 	solutions: [
// 		"Leveraged an undirected graph representation of the puzzle and solved using constraint propagation",
// 		"Used Playwright to automate browser interactions and retrieve daily puzzle data",
// 	],
// 	features: [
// 		"Solves daily N-Queens puzzle for any difficulty",
// 		"Automated LinkedIn game interaction",
// 		"Serverless deployment on Cloudflare Workers",
// 	],
// };

export async function loader({ context }: Route.LoaderArgs) {
	using result = await context.cloudflare.env.DATABASE.getQueens();
	if (result.error) {
		console.error("Error fetching queens:", result.error);
		return { solution: undefined, error: result.error };
	}
	return { solutionData: result.data, error: undefined };
}

export default function ({ loaderData }: Route.ComponentProps) {
	const data = loaderData;
	if (data.error) {
		return "Error";
	}
	const solution = data.solutionData?.solution;
	return (
		<QueensGrid
			cellColors={solution.cellColors}
			colors={solution.colors}
			queenPositions={solution.queenPositions}
			sideLength={solution.sideLength}
			cellsRemoved={solution.cellsRemoved}
		/>
	);
}
