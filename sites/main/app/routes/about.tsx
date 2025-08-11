import type { Resume } from "shared";
import { EmptyResume } from "shared";
import { About } from "#pages/about";
import { usePromise } from "#utils";
import type { Route } from "./+types/about";

export async function loader({ context }: Route.LoaderArgs) {
	const _context = context;
	const resumeData: Promise<Resume> = new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					name: "Connor Bray",
					about: {
						phoneNumber: "(207) 272-6463",
						emailAddress: "connor@connorbray.net",
						location: "Boston, MA",
						languages: ["C#", "JavaScript/TypeScript", "Python", "SQL", "C"],
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
								"Improved end-to-end test performance by 95% through the implementation of parallelization and test optimization techniques. Total test suite execution time reduced from 72 hours to X hours",
								"Owned the modernization effort of a product team, responsible for the porting of 3 million lines of legacy code to a C# .NET stack",
								"Engineered a robust testing framework with comprehensive unit, regression, and end-to-end (E2E) tests to ensure functional parity and prevent regressions",
								"Mentored and led a team of 3 engineers, establishing best practices for code review, agile methodologies, and system architecture to improve team performance and code quality",
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
								"Creates an undirected graph representation of the n-queens puzzle and uses constraint propagation to reduce the search space until the solution is found",
								"Scheduled to execute daily and post results to linkedin-games.win",
								"Technologies: TypeScript, Playwright, Cloudflare Workers",
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
			1000,
		);
	});
	return { resumeData };
}

/**
 * On initial page load, fetch the data from the server and cache it in sessionStorage.
 *
 * On subsequent page loads, read the data from sessionStorage and return it.
 *
 * This function is used to improve performance by reducing the number of requests made to the server.
 */
export async function clientLoader({
	request,
	serverLoader,
}: Route.ClientLoaderArgs): Promise<{ resumeData: Promise<Resume> }> {
	// Check if the data is already cached in sessionStorage
	const cacheKey = request.url;
	const cachedData = sessionStorage.getItem(cacheKey);

	// If the data is cached, return it
	if (cachedData) {
		return { resumeData: JSON.parse(cachedData) };
	}

	// If the data is not cached, fetch it from the server
	const { resumeData } = await serverLoader();

	// Cache the data in sessionStorage for future use
	resumeData.then((data) => {
		sessionStorage.setItem(cacheKey, JSON.stringify(data));
	});

	return { resumeData };
}

export default function ({ loaderData }: Route.ComponentProps) {
	const { data, error, loading } = usePromise<Resume>(loaderData.resumeData, EmptyResume);

	if (error) {
		console.error("Error loading resume data:", error);
	}

	return <About resume={data} loading={loading} />;
}
