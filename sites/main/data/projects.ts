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
			"AWS Lambda function for automated serverless execution",
			"Cloudflare Workers Queue for publishing results",
			"Automated browser interaction using Playwright",
			"Achieves 100% success rate on all puzzle sizes",
		],
		technologies: ["TypeScript", "AWS Lambda", "Cloudflare Workers", "Playwright"],
		repositoryUrl: "https://github.com/connorb08/queens",
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
		description:
			"Personal portfolio built with TypeScript and deployed globally at the edge. Focused on performance, accessibility, and a maintainable design system.",
		about: [
			"Built using React + TypeScript",
			"Client routing with React Router; logical route + layout composition",
			"Custom design system: SCSS modules + tokens (color, spacing, typography, elevation)",
			"Automated build & deploy via GitHub Actions to Cloudflare Workers (edge)",
			"Performance tuned: code splitting, prefetch hints, lazy hydration of non-critical UI",
			"Accessibility baked in: semantic structure, reduced motion support, color contrast checks",
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
		challenges: [],
		solutions: [],
		features: [
			"Fast first paint (<1KB critical CSS inlined; deferred non-essential bundles)",
			"Dark / light theme with system preference + persistent user override",
			"Project and resume data sourced from strongly typed modules",
			"Smooth but mindful animations and micro-interactions",
			"Semantic HTML + ARIA patterns; keyboard-first navigation",
			"Edge deployment with automated CI/CD (build → test → deploy)",
		],
	},
	{
		slug: "resume",
		name: "HTML Resume",
		description:
			"JSON defined resume rendered as semantic HTML/CSS with print/PDF fidelity and zero runtime dependencies.",
		about: [
			"Hand-authored semantic HTML structure",
			"Tokenized spacing & typography scale for consistent sizing across breakpoints",
			"Print stylesheet tuned for 1–2 page PDF export",
			"Shared data model aligned with broader portfolio project for DRY content maintenance",
			"Lightweight build (no client JS needed for core content)",
		],
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
		challenges: [
			"Maintain consistent vertical rhythm across varied screen densities and print",
			"Avoid duplicating resume data across portfolio and standalone resume",
			"Balance print precision with responsive fluid layout",
			"Ensure fast load with minimal critical CSS",
		],
		solutions: [
			"Implemented percentage spacing scale",
			"Centralized experience & project entries in typed data modules consumed by both sites",
			"Separate print media queries controlling page breaks and non-print decorative elements",
			"Inlined critical CSS and deferred any non-essential styles",
		],
		features: [
			"Instant printable / PDF-friendly layout (no JS requirement)",
			"Consistent spacing & typographic hierarchy across devices",
			"Single content source shared with main portfolio",
			"Accessible semantic landmarks and heading structure",
			"Automated deploy via CI/CD to edge (Cloudflare Workers)",
		],
	},
	{
		slug: "fstop",
		name: "cumberland-foodstop.com",
		description:
			"Marketing & menu site for a local food business with self-service weekly specials management and edge delivery.",
		about: [
			"Next.js (React + TypeScript) for static pre-rendered pages and fast navigation",
			"Tailwind CSS utility layer with a small set of extracted component patterns",
			"Edge deployment on Cloudflare Workers for low-latency regional access",
			"Lightweight admin interface to update weekly specials without developer involvement",
			"Image optimization & responsive sources for product / menu imagery",
		],
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
		challenges: [
			"Enable non-technical staff to update weekly specials safely",
			"Keep content fast globally with minimal hosting overhead",
			"Ensure menu & specials remain readable across mobile form factors",
			"Optimize images without manual intervention",
			"Preserve brand consistency while iterating quickly",
		],
		solutions: [
			"Built a simple authenticated admin upload form writing structured specials data",
			"Used static generation with edge caching on Cloudflare Workers",
			"Applied responsive layout primitives and clamp-based fluid typography",
			"Leveraged Next.js image optimization pipeline for automatic sizing & format selection",
			"Abstracted repeatable Tailwind patterns into small component utilities",
		],
		features: [
			"Responsive menu & specials pages",
			"Self-service weekly specials admin workflow",
			"Edge-cached static assets for low latency",
			"Optimized images (responsive srcset & modern formats)",
			"Accessible navigation & color contrast compliance",
			"Automated CI/CD pipeline (build → test → deploy)",
		],
	},
];

export function getProjectBySlug(slug: string): ExtendedProject | undefined {
	return projectsData.find((project) => project.slug === slug);
}

export function getAllProjectSlugs(): string[] {
	return projectsData.map((project) => project.slug);
}
