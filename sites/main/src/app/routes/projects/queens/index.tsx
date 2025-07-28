import { QueensResult } from "components";
import { NavLink } from "react-router";
import type { GameData } from "shared";
import { ProjectDetail } from "../../../../components/project";
import type { Route } from "./+types";

export async function loader({ context }: Route.LoaderArgs) {
	const gameData: GameData = await context.cloudflare.env.API.queensResult();
	console.log("Queens game data:", gameData);
	return { data: gameData };
}

const projectData = {
	slug: "linkedin-queens",
	name: "LinkedIn N-Queens Solver",
	description: "Automated solver for LinkedIn's Queens puzzle game",
	about: [
		"Implemented constraint propagation algorithm in TypeScript",
		"Cloudflare Workers for serverless execution",
		"Automated browser interaction using Playwright",
		"Achieves 100% success rate on all puzzle sizes",
	],
	technologies: [
		"TypeScript",
		"Cloudflare Workers",
		"Playwright",
		"Puppeteer",
		"Algorithm Design",
		"Web Scraping",
		"Automation",
	],
	repositoryUrl: "https://github.com/connorb08/queens",
	liveUrl: "https://linkedin-games.win",
	images: [],
	challenges: [
		"Implementing an efficient backtracking algorithm for N-Queens",
		"Handling dynamic board sizes and constraints",
		"Automating browser interactions reliably",
		"Optimizing performance for larger board sizes",
	],
	solutions: [
		"Used optimized backtracking with constraint propagation",
		"Implemented adaptive algorithms based on board size",
		"Built robust browser automation with retry mechanisms",
		"Added memoization and pruning techniques for performance",
	],
	features: [
		"Solves N-Queens puzzle for any board size up to 20x20",
		"Multiple solving algorithms with performance comparison",
		"Real-time visualization of the solving process",
		"Automated LinkedIn game interaction",
		"Performance metrics and solution analytics",
		"Serverless deployment on Cloudflare Workers",
	],
};

export default function ({ loaderData }: Route.ComponentProps) {
	const { data } = loaderData;
	return (
		<div>
			<div
				style={{
					padding: "1rem 2rem",
				}}
			>
				<NavLink
					to="/projects"
					viewTransition
					style={{
						color: "var(--md-sys-color-primary, #6750a4)",
						textDecoration: "none",
						fontSize: "0.875rem",
						fontWeight: "500",
					}}
				>
					← Back to Projects
				</NavLink>
			</div>

			<ProjectDetail
				project={projectData}
				technologies={projectData.technologies}
				repositoryUrl={projectData.repositoryUrl}
				liveUrl={projectData.liveUrl}
				images={projectData.images}
				heroElement={<QueensResult {...data} />}
				challenges={projectData.challenges}
				solutions={projectData.solutions}
				features={projectData.features}
			/>
		</div>
	);
}
