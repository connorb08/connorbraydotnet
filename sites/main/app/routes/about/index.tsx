import type { Resume } from "shared";
import { EmptyResume } from "shared";
import { usePromise } from "#utils";
import aboutMe from "../../../data/about-me";
import type { Route } from "./+types";
import { About } from "./about";
import type { LeadershipRole } from "./about/tabs/leadership";

export async function loader() {
	const resumeData: Promise<Resume> = new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					name: "Connor Bray",
					about: {
						phoneNumber: "(207) 272-6463",
						emailAddress: "connor@connorbray.net",
						location: "Boston, MA",
						languages: ["C#", "TypeScript/JavaScript", "Python", "SQL", "C"],
						technologies: ["Git", "React", "Terraform", "AWS", "Docker"],
						interests: ["Distributed Computing", "Containerization", "Software Infrastructure"],
					},
					career: [
						{
							company: "Tyler Technologies",
							title: "Software Engineer",
							location: "Yarmouth, ME",
							startDate: "May 2021",
							endDate: "Present",
							about: [
								"Implemented multi-tenant architecture and concurrency optimizations in the E2E test runner, cutting execution time from 3 days to under 1 day (5x faster) and enabling scalable performance.",
								"Partnered with cross-functional teams to improve project organization and developer workflows in large-scale greenfield projects, increasing developer velocity and reducing onboarding friction.",
								"Led modernization of 3M+ lines of legacy code to a modern .NET stack, ensuring maintainability, performance, and functional parity.",
								"Built unit, regression, and E2E tests that reduced defects and safeguarded product stability.",
								"Mentored a team of 3+ engineers, introducing coding standards and best practices that improved code quality and team efficiency.",
								"Automated deployment pipelines, reducing manual steps and minimizing release errors.",
							],
						},
					],
					education: [
						{
							school: "University of Maine",
							location: "Orono, ME",
							degree: "B.S. Computer Science",
							startDate: "",
							endDate: "",
							about: ["Student Body President"],
						},
					],
					projects: [
						{
							name: "Linkedin Queens",
							description: "Solver for daily linkedin n-queens puzzle",
							about: [
								"Built an undirected graph-based and used constraint propagation to efficiently reduce search space.",
								"Deployed to AWS Lambda and Cloudflare Workers to run daily and publish results.",
								"Technologies: TypeScript, Playwright, AWS S3/Lambda, Cloudflare Workers.",
							],
						},
						{
							name: "HTML Resume",
							description:
								"Generates a resume from a JSON file using HTML/CSS and validate it with JSON schema validation.",
							about: [
								"Allows for pixel-perfect formatting and easy updating / maintainability",
								"You are likely viewing this resume as a PDF, but it was created using this project",
								"Technologies: HTML, CSS, TypeScript, React",
							],
						},
					],
				}),
			1,
		);
	});

	const leadershipRoles: LeadershipRole[] = [
		{
			id: 0,
			name: "University of Maine Alumni Association",
			position: "Board of Directors",
		},
	];

	return { resumeData, leadershipRoles, aboutMe };
}

/**
 * On initial page load, fetch the data from the server and cache it in sessionStorage.
 *
 * On subsequent page loads, read the data from sessionStorage and return it.
 *
 * This function is used to improve performance by reducing the number of requests made to the server.
 */
export async function clientLoader({ request, serverLoader }: Route.ClientLoaderArgs) {
	// Check if the data is already cached in sessionStorage
	const cacheKey = request.url;
	const cachedData = sessionStorage.getItem(cacheKey);

	// If the data is cached, return it
	if (cachedData) {
		return JSON.parse(cachedData);
	}

	// If the data is not cached, fetch it from the server
	const { resumeData, leadershipRoles, aboutMe } = await serverLoader();

	// Cache the data in sessionStorage for future use
	resumeData.then((data) => {
		sessionStorage.setItem(
			cacheKey,
			JSON.stringify({ resumeData: data, leadershipRoles, aboutMe }),
		);
	});

	return { resumeData, leadershipRoles, aboutMe };
}

export default function ({ loaderData }: Route.ComponentProps) {
	const { data, error, loading } = usePromise<Resume>(loaderData.resumeData, EmptyResume);

	if (error) {
		console.error("Error loading resume data:", error);
	}

	return (
		<About
			resume={data}
			leadershipRoles={loaderData.leadershipRoles}
			aboutMe={loaderData.aboutMe}
			loading={loading}
		/>
	);
}
