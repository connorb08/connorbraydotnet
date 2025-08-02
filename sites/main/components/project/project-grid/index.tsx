import type { ResumeProject } from "shared";
import ProjectPreviewCard from "../project-preview-card";
import style from "./style.module.scss";

interface ProjectGridProps {
	projects: ResumeProject[];
	onProjectClick?: (project: ResumeProject) => void;
}

export default function ProjectGrid({
	projects,
	onProjectClick,
}: ProjectGridProps) {
	return (
		<div className={style.projectGrid}>
			{projects.map((project, index) => (
				<ProjectPreviewCard
					key={`${project.name}-${index}`}
					project={project}
					onClick={onProjectClick ? () => onProjectClick(project) : undefined}
				/>
			))}
		</div>
	);
}
