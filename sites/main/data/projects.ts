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
}

export const projectsData: ExtendedProject[] = [
	{
		slug: "portfolio",
		name: "connorbray.net",
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
		images: [],
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
	},
	{
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
		liveUrl: "https://connorbray.net/queens",
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
	},
];

export function getProjectBySlug(slug: string): ExtendedProject | undefined {
	return projectsData.find((project) => project.slug === slug);
}

export function getAllProjectSlugs(): string[] {
	return projectsData.map((project) => project.slug);
}
