import { ProjectGrid } from "../../../../components/project/project-grid";
import { projectsData } from "../../../../data/projects";
import style from "./projects.module.scss";

export default function Projects() {
	const projects = projectsData;

	return (
		<div className={style.projects}>
			<div className={style.projects__header}>
				<h1 className={style.projects__title}>Projects</h1>
				<p className={style.projects__description}>
					Here are some of the projects I've worked on. Each one showcases different
					technologies and approaches to solving real-world problems.
				</p>
			</div>

			<section className={style.projects__grid}>
				<h2 className={style.projects__sectionTitle}>Recent Work</h2>
				<ProjectGrid projects={projects} />
			</section>
		</div>
	);
}
