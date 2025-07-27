import type { ResumeProject } from "shared";
import { ProjectDetail } from "../../components/project";

// Example of how to use the ProjectDetail component on a dedicated project page
// This would typically be a dynamic route like /projects/[slug]

const exampleProject: ResumeProject = {
	name: "Personal Portfolio Website",
	description: "A modern, responsive portfolio built with React and TypeScript",
	about: [
		"Built with React Router and TypeScript for type safety",
		"Implemented Material Design system with SCSS modules",
		"Deployed on Cloudflare Pages with automated CI/CD",
		"Optimized for performance and accessibility",
	],
};

// Extended project data that would typically come from a CMS or database
const extendedProjectData = {
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
	repositoryUrl: "https://github.com/user/portfolio",
	liveUrl: "https://portfolio.example.com",
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
	status: "maintained" as const,
};

export default function ProjectDetailPage() {
	return <ProjectDetail project={exampleProject} {...extendedProjectData} />;
}
