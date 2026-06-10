import { NavLink } from "react-router";
import type { ExtendedProject } from "../../../data/projects";
import style from "./style.module.scss";

interface ProjectPreviewCardProps {
	project: ExtendedProject;
}

export default function ProjectPreviewCard(props: ProjectPreviewCardProps) {
	const project = props.project;

	return (
		<NavLink to={project.path ?? `/projects/${project.slug}`} viewTransition>
			<article className={style.previewCard}>
				<div className={style.previewCard__header}>
					<h3 className={style.previewCard__title}>{project.name}</h3>
					{project.description && (
						<p className={style.previewCard__description}>{project.description}</p>
					)}
				</div>

				{project.about && project.about.length > 0 && (
					<div className={style.previewCard__content}>
						<ul className={style.previewCard__highlights}>
							{project.about.slice(0, 3).map((detail, index) => (
								<li key={index} className={style.previewCard__highlight}>
									{detail}
								</li>
							))}
							{project.about.length > 3 && (
								<li className={style.previewCard__more}>
									+{project.about.length - 3} more features
								</li>
							)}
						</ul>
					</div>
				)}

				<div className={style.previewCard__footer}>
					<span className={style.previewCard__cta}>View Details →</span>
				</div>
			</article>
		</NavLink>
	);
}
