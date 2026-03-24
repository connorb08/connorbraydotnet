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
				"Remix/Next.js",
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
				"CI/CD Pipelines",
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
						"Built an end-to-end multi-tenant test runner with concurrency optimizations, cutting execution time from 3 days to under 1 day (5× speedup).",
						"Led modernization of a 3M+ line legacy codebase to modern .NET, preserving functionality while significantly improving performance and maintainability.",
						"Designed and implemented unit, regression, and end-to-end test suites that reduced production defects and improved system reliability.",
						"Developed automated code formatting tools to enforce consistent style across the codebase.",
						"Mentored junior engineers on best practices, code review standards, and architectural patterns.",
						"Rewrote important legacy processes to improve reliability and performance, increasing runtime execution speed by over 10×.",
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
					name: "LinkedIn Puzzle Solver – queens.connorbray.net",
					description: "Automated solver for daily linkedin n-queens puzzle",
					about: [
						"Solves constraint satisfaction problem using constraint propogation, implemented using an undirected graph.",
						"Deployed to AWS Lambda and Cloudflare Workers to run daily and publish results.",
						"Technologies: C#/.NET, Playwright, AWS S3/Lambda, Cloudflare Workers.",
					],
				},
				{
					name: "cumberland-foodstop.com",
					description: "Customer-facing website for local restaurant & convenience store",
					about: [
						"Designed and deployed a responsive web app, improving online visibility and customer access.",
						"Implemented TypeScript-based front end and cloud hosting via Cloudflare.",
					],
				},
			],
		},
	],
	options: {
		order: ["Experience", "Education", "Projects"],
	},
};
