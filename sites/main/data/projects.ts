import type { ResumeProject } from "shared";

export interface ExtendedProject extends ResumeProject {
	slug: string;
	technologies: string[];
	repositoryUrl?: string;
	liveUrl?: string;
	challenges: string[];
	solutions: string[];
	features: string[];
}

export const projectsData: ExtendedProject[] = [
	{
		slug: "queens",
		name: "LinkedIn N-Queens Solver",
		description: "Automated solver for LinkedIn's Queens puzzle game",
		about: [
			"Implemented constraint propagation algorithm in TypeScript",
			"Cloudflare Workers for serverless execution",
			"Automated browser interaction using Playwright",
			"Achieves 100% success rate on all puzzle sizes",
		],
		technologies: ["TypeScript", "Playwright", "Cloudflare Workers"],
		repositoryUrl: "https://github.com/connorb08/connorbraydotnet/services/queens",
		liveUrl: "https://linkedin-games.win",
		challenges: [
			"Implementing an efficient constraint satisfaction algorithm for modified N-Queens puzzle",
			"Get daily puzzle info from Linkedin website",
		],
		solutions: [
			"Leveraged an undirected graph representation of the puzzle and solved using constraint propagation",
			"Used Playwright to automate browser interactions and retrieve daily puzzle data",
		],
		features: [
			"Solves daily N-Queens puzzle for any difficulty",
			"Automated LinkedIn game interaction",
			"Serverless deployment on Cloudflare Workers",
		],
	},
	{
		slug: "portfolio",
		name: "connorbray.net",
		description: "A modern, responsive portfolio built with modern web technologies",
		about: [
			"Built with React Router and TypeScript for type safety",
			"Implemented Material Design system with SCSS modules",
			"Deployed on Cloudflare Workers with automated CI/CD",
			"Optimized for performance and accessibility",
		],
		technologies: [
			"React",
			"TypeScript",
			"Vite",
			"SCSS",
			"React Router",
			"Cloudflare Workers",
			"GitHub Actions",
		],
		repositoryUrl: "https://github.com/connorb08/connorbraydotnet",
		liveUrl: "https://connorbray.net",
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
			"Set up GitHub Actions with Cloudflare Workers for automated deployment",
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
		slug: "fstop",
		name: "cumberland-foodstop.com",
		description: "Website for a local business",
		about: ["Built with Next.js and TypeScript", "Deployed on Cloudflare Workers"],
		technologies: [
			"React",
			"TypeScript",
			"Vite",
			"Tailwind CSS",
			"Next.js",
			"Cloudflare Workers",
			"GitHub Actions",
		],
		repositoryUrl: "https://github.com/connorb08/fstop",
		liveUrl: "https://cumberland-foodstop.com",
		challenges: ["Allow updating of weekly specials"],
		solutions: ["Admin page for uploading weekly specials"],
		features: [],
	},
	{
		slug: "resume",
		name: "HTML Resume",
		description: "Resume built in HTML/CSS",
		about: ["HTML"],
		technologies: [
			"HTML",
			"CSS",
			"JSON",
			"React",
			"TypeScript",
			"Vite",
			"SCSS",
			"Cloudflare Workers",
			"GitHub Actions",
		],
		repositoryUrl: "https://github.com/connorb08/connorbraydotnet/sites/resume",
		liveUrl: "https://resume.connorbray.net",
		challenges: ["Maintain spacing across different screen sizes"],
		solutions: ["Use percentage based spacing"],
		features: [""],
	},
];

export function getProjectBySlug(slug: string): ExtendedProject | undefined {
	return projectsData.find((project) => project.slug === slug);
}

export function getAllProjectSlugs(): string[] {
	return projectsData.map((project) => project.slug);
}
