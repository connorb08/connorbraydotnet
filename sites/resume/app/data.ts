import type { Resume } from "shared";

export const resumeData: Resume = {
	about: {
		name: "Connor Bray",
		phoneNumber: "(207) 272-6463",
		emailAddress: "connor@connorbray.net",
		location: "Boston, MA",
		summary:
			"Full-stack software engineer experienced in building scalable, high-performance systems and improving developer experience across frontend, backend, and CI/CD. Passionate about accessibility, reliability, and efficient engineering practices.",
	},
	skills: {
		languages: ["C#", "TypeScript/JavaScript", "Python", "SQL", "C"],
		technologies: [".NET", "Git", "Docker", "Terraform", "AWS", "CI/CD"],
		interests: [
			"Distributed Systems",
			"Containerization",
			"Software Infrastructure",
			"Developer Experience",
		],
	},
	career: [
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
		{
			company: "UMaine Student Government Inc.",
			title: "President & Board Chair",
			location: "Orono, ME",
			startDate: "May 2022",
			endDate: "May 2023",
			about: [
				"Served as Chief Executive and Board Chair of a 501(c)(3) nonprofit, directing a team of 3 full-time staff and 40+ student employees/volunteers.",
				"Assumed interim responsibility for financial operations, managing a $1M+ budget and ensuring fiscal sustainability.",
				"Worked directly with university leadership to advocate for students, contributing to policy changes that improved student welfare.",
				"Chaired weekly board meetings using Robert’s Rules of Order to ensure effective governance.",
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
			about: [],
			// about: ["Student Body President"],
		},
	],
	projects: [],
	boardPositions: [],
	// sections: [
	// 	{
	// 		title: "Experience",
	// 		items: [
	// 			{
	// 				company: "Tyler Technologies",
	// 				title: "Software Engineer",
	// 				location: "Yarmouth, ME",
	// 				startDate: "May 2021",
	// 				endDate: "Present",
	// 				about: [
	// 					"Implemented multi-tenant architecture and concurrency optimizations in the E2E test runner, cutting execution time from 3 days to under 1 day (5x faster) and enabling scalable performance.",
	// 					"Partnered with cross-functional teams to improve project organization and developer workflows in large-scale greenfield projects, increasing developer velocity and reducing onboarding friction.",
	// 					"Led modernization of 3M+ lines of legacy code to a modern .NET stack, ensuring maintainability, performance, and functional parity.",
	// 					"Built unit, regression, and E2E tests that reduced defects and safeguarded product stability.",
	// 					"Mentored a team of 3+ engineers, introducing coding standards and best practices that improved code quality and team efficiency.",
	// 					"Automated deployment pipelines, reducing manual steps and minimizing release errors.",
	// 					"Automated deployment pipelines, reducing manual steps and minimizing release errors.",
	// 				],
	// 			},
	// 			{
	// 				company: "UMaine Student Government Inc.",
	// 				title: "President & Board Chair",
	// 				location: "Orono, ME",
	// 				startDate: "May 2021",
	// 				endDate: "Present",
	// 				about: [
	// 					"Oversee a $1 million budget ",
	// 					"Oversee 20? student part time employees, 3? full time employees, and ~20 volunteer board members",
	// 					"Led initiatives that improved student engagement and campus life, resulting in a 15% increase in student participation in events and programs.",
	// 					"Met with university leadership regularly to advocate for student needs, leading to the implementation of new policies that enhanced student welfare.",
	// 					"Managed student organizations and allocated funding to support their activities, fostering a vibrant campus community.",
	// 					"Coordinated with various campus departments to organize events and programs that enriched the student experience.",
	// 				],
	// 			},
	// 		],
	// 	},
	// 	{
	// 		title: "Education",
	// 		items: [
	// 			{
	// 				school: "University of Maine",
	// 				location: "Orono, ME",
	// 				degree: "B.S. Computer Science",
	// 				startDate: "",
	// 				endDate: "",
	// 				about: ["Student Body President"],
	// 			},
	// 		],
	// 	},
	// 	{
	// 		title: "Boards",
	// 		items: [
	// 			{
	// 				name: "University of Maine Alumni Association",
	// 				role: "Board Member",
	// 				about: [
	// 					"Collaborate with fellow board members to support alumni engagement and university initiatives.",
	// 				],
	// 			},
	// 			{
	// 				name: "University of Maine Student Government Inc.",
	// 				role: "Board Member",
	// 				about: [
	// 					"Collaborate with fellow board members to support alumni engagement and university initiatives.",
	// 				],
	// 			},
	// 		],
	// 	},
	// 	{
	// 		title: "Projects",
	// 		items: [
	// 			{
	// 				name: "Linkedin Queens",
	// 				description: "Automated solver for daily linkedin n-queens puzzle",
	// 				about: [
	// 					"Built an undirected graph-based and used constraint propagation to efficiently reduce search space.",
	// 					"Deployed to AWS Lambda and Cloudflare Workers to run daily and publish results.",
	// 					"Technologies: TypeScript, Playwright, AWS S3/Lambda, Cloudflare Workers.",
	// 				],
	// 			},
	// 			{
	// 				name: "cumberland-foodstop.com",
	// 				description: "Customer-facing website for local restaurant & convenience store",
	// 				about: [
	// 					"Designed and deployed a responsive web app, improving online visibility and customer access.",
	// 					"Implemented TypeScript-based front end and cloud hosting via Cloudflare.",
	// 				],
	// 			},
	// 		],
	// 	},
	// ],
	// order: ["Experience", "Education", "Boards", "Projects"],
};
