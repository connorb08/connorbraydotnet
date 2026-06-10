import type { Resume } from "schemas";

export const resumeData: Resume = {
	about: {
		name: "Connor Bray",
		phoneNumber: "(207) 272-6463",
		emailAddress: "connor@connorbray.net",
		location: "Boston, MA",
	},
	skills: [
		{
			skillName: "Languages",
			skillList: ["C#", "TypeScript/JavaScript", "Python", "SQL", "C"],
		},
		{
			skillName: "Technologies",
			skillList: [
				".NET",
				"Git",
				"Docker",
				"Terraform",
				"AWS",
				"React",
				"Remix/React Router/Next.js",
				"Playwright",
			],
		},
		{
			skillName: "Focus Areas",
			skillList: [
				"Distributed Systems",
				"Containerization",
				"Software Infrastructure",
				"Developer Experience",
				"Cloud Architecture",
				"Browser Automation",
				"CI/CD Pipelines",
				"Infrastructure as Code",
			],
		},
	],
	sections: [
		{
			title: "Experience",
			items: [
				{
					company: "Tyler Technologies",
					title: "Software Engineer",
					location: "Yarmouth, ME",
					startDate: "May 2021",
					endDate: "Present",
					about: [
						"Reworked end-to-end test runner from the ground up to add multi-tenant support and concurrency, cutting execution time from 3 days to under 1 day (5× speedup).",
						"Owned modernization efforts of a 3M+ line legacy codebase to modern .NET, preserving functionality while significantly improving performance and maintainability.",
						"Designed and implemented unit, regression, and end-to-end test suites that reduced production defects and improved system reliability.",
						"Developed automated code formatting tools to enforce consistent style across the codebase.",
						"Built internal tooling to streamline local engineer workflows, reducing friction around building, launching, and environment management.",
						"Mentored junior engineers on best practices, code review standards, and architectural patterns.",
						"Rewrote critical legacy processes to improve reliability and performance, increasing runtime execution speed by over 10×.",
					],
				},
			],
		},
		{
			title: "Education",
			items: [
				{
					school: "University of Maine",
					location: "Orono, ME",
					degree: "B.S. Computer Science",
					startDate: "",
					endDate: "",
					about: ["Student Body President"],
				},
			],
		},
		{
			title: "Projects",
			items: [
				{
					name: "LinkedIn Puzzle Solver – connorbray.net/queens",
					description: "Automated solver for daily LinkedIn n-queens puzzle",
					about: [
						"Solves constraint satisfaction problem using constraint propagation, implemented using an undirected graph.",
						"Scrapes daily game data via a scheduled AWS Lambda function using Playwright; a .NET process models the problem as a graph and searches for a solution.",
						"Deployed to AWS Lambda and Cloudflare Workers to run daily and publish results.",
						"Technologies: C#/.NET, Playwright, AWS S3/Lambda, SQLite, Terraform, Cloudflare Workers.",
					],
				},
			],
		},
	],
	options: {
		order: ["Experience", "Education", "Projects"],
	},
};
