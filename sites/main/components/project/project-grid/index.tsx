import type { ExtendedProject } from "../../../data/projects";
import ProjectPreviewCard from "../project-preview-card";
import style from "./style.module.scss";

interface ProjectGridProps {
	projects: ExtendedProject[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
	return (
		<div className={style.projectGrid}>
			{projects.map((project, index) => (
				<ProjectPreviewCard key={`${project.name}-${index}`} project={project} />
			))}
		</div>
	);
}
