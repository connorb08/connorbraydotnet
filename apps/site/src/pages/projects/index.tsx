import type { ResumeProject } from "shared";
import { ProjectGrid } from "../../components/project";
import { projectsData } from "../../data/projects";
import style from "./projects.module.scss";

export default function Projects() {
	const handleProjectClick = (project: ResumeProject) => {
		// Find the corresponding project with slug
		const fullProject = projectsData.find((p) => p.name === project.name);
		if (fullProject) {
			// Navigate to project detail page using the slug
			window.location.href = `/projects/${fullProject.slug}`;
		}
	};

	// Convert extended projects to basic ResumeProject format for the grid
	const basicProjects: ResumeProject[] = projectsData.map((project) => ({
		name: project.name,
		description: project.description,
		about: project.about,
	}));

	return (
		<div className={style.projects}>
			<div className={style.projects__header}>
				<h1 className={style.projects__title}>Projects</h1>
				<p className={style.projects__description}>
					Here are some of the projects I've worked on. Each one showcases
					different technologies and approaches to solving real-world problems.
				</p>
			</div>

			<section className={style.projects__grid}>
				<h2 className={style.projects__sectionTitle}>Recent Work</h2>
				<ProjectGrid
					projects={basicProjects}
					onProjectClick={handleProjectClick}
				/>
			</section>
		</div>
	);
}
