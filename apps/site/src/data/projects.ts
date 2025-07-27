import type { ResumeProject } from "shared";

// Extended project interface for detailed pages
export interface ExtendedProject extends ResumeProject {
	slug: string;
	technologies: string[];
	repositoryUrl?: string;
	liveUrl?: string;
	images: string[];
	challenges: string[];
	solutions: string[];
	features: string[];
	timeline: {
		start: string;
		end?: string;
	};
	teamSize?: number;
	role?: string;
	status: "completed" | "in-progress" | "maintained" | "deprecated";
}

export const projectsData: ExtendedProject[] = [
	{
		slug: "personal-portfolio-website",
		name: "Personal Portfolio Website",
		description:
			"A modern, responsive portfolio built with React and TypeScript",
		about: [
			"Built with React Router and TypeScript for type safety",
			"Implemented Material Design system with SCSS modules",
			"Deployed on Cloudflare Pages with automated CI/CD",
			"Optimized for performance and accessibility",
		],
		technologies: [
			"React",
			"TypeScript",
			"Vite",
			"SCSS",
			"React Router",
			"Cloudflare Pages",
			"GitHub Actions",
			"Biome",
		],
		repositoryUrl: "https://github.com/connorb08/connorbraydotnet",
		liveUrl: "https://connorbray.net",
		images: [
			"/projects/portfolio/hero.jpg",
			"/projects/portfolio/about.jpg",
			"/projects/portfolio/projects.jpg",
			"/projects/portfolio/contact.jpg",
		],
		challenges: [
			"Creating a responsive design that works across all devices",
			"Implementing smooth animations without impacting performance",
			"Building a maintainable CSS architecture with SCSS modules",
			"Setting up automated deployment with proper CI/CD pipeline",
		],
		solutions: [
			"Used CSS Grid and Flexbox with fluid typography for responsive design",
			"Implemented CSS transforms and transitions with will-change optimization",
			"Created a design system with reusable SCSS mixins and variables",
			"Set up GitHub Actions with Cloudflare Pages for automated deployment",
		],
		features: [
			"Fully responsive design optimized for all screen sizes",
			"Dark and light theme support with system preference detection",
			"Smooth scroll animations and micro-interactions",
			"SEO optimized with proper meta tags and structured data",
			"Fast loading with code splitting and lazy loading",
			"Accessible design following WCAG 2.1 guidelines",
		],
		timeline: {
			start: "2024-01",
			end: "2024-03",
		},
		teamSize: 1,
		role: "Full-Stack Developer & Designer",
		status: "maintained",
	},
	{
		slug: "task-management-api",
		name: "Task Management API",
		description: "RESTful API for managing tasks and projects",
		about: [
			"Developed using Node.js and Express with TypeScript",
			"PostgreSQL database with Kysely query builder",
			"JWT authentication and role-based authorization",
			"Comprehensive test suite with 95% code coverage",
		],
		technologies: [
			"Node.js",
			"Express",
			"TypeScript",
			"PostgreSQL",
			"Kysely",
			"JWT",
			"Vitest",
			"Docker",
			"Railway",
		],
		repositoryUrl: "https://github.com/example/task-api",
		liveUrl: "https://api.taskmanager.example.com",
		images: [
			"/projects/task-api/architecture.jpg",
			"/projects/task-api/endpoints.jpg",
			"/projects/task-api/testing.jpg",
		],
		challenges: [
			"Designing a scalable database schema for complex relationships",
			"Implementing secure authentication and authorization",
			"Creating comprehensive API documentation",
			"Setting up robust error handling and logging",
		],
		solutions: [
			"Used PostgreSQL with proper indexing and foreign key constraints",
			"Implemented JWT tokens with refresh token rotation",
			"Generated OpenAPI documentation with automated examples",
			"Built centralized error handling middleware with structured logging",
		],
		features: [
			"RESTful API design following OpenAPI 3.0 specification",
			"Role-based access control with granular permissions",
			"Real-time notifications using WebSocket connections",
			"Comprehensive test suite with unit and integration tests",
			"Docker containerization for easy deployment",
			"Automated database migrations and seeding",
		],
		timeline: {
			start: "2023-09",
			end: "2023-12",
		},
		teamSize: 2,
		role: "Backend Developer",
		status: "completed",
	},
	{
		slug: "linkedin-game-solver",
		name: "LinkedIn Game Solver",
		description: "Automated solver for LinkedIn's Queens puzzle game",
		about: [
			"Implemented backtracking algorithm in TypeScript",
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
		liveUrl: "https://queens.connorbray.net",
		images: [
			"/projects/queens/demo.jpg",
			"/projects/queens/algorithm.jpg",
			"/projects/queens/results.jpg",
		],
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
		timeline: {
			start: "2024-04",
			end: "2024-05",
		},
		teamSize: 1,
		role: "Algorithm Developer",
		status: "completed",
	},
];

// Helper function to get project by slug
export function getProjectBySlug(slug: string): ExtendedProject | undefined {
	return projectsData.find((project) => project.slug === slug);
}

// Helper function to get all project slugs
export function getAllProjectSlugs(): string[] {
	return projectsData.map((project) => project.slug);
}
