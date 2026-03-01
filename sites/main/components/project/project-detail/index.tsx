import type { ProjectItem as ResumeProject } from "shared";
import style from "./style.module.scss";

interface ProjectDetailProps {
	project: ResumeProject;
	// Extended project data for full page view
	technologies?: string[];
	repositoryUrl?: string;
	liveUrl?: string;
	challenges?: string[];
	solutions?: string[];
	features?: string[];
	heroElement?: React.ReactNode | null | undefined;
}

export default function ProjectDetail({
	project,
	technologies = [],
	repositoryUrl,
	liveUrl,
	challenges = [],
	solutions = [],
	features = [],
	heroElement = null,
}: ProjectDetailProps) {
	return (
		<article className={style.projectDetail}>
			{/* Hero Section */}
			<header className={style.projectDetail__hero}>
				<div className={style.projectDetail__heroContent}>
					<h1 className={style.projectDetail__title}>{project.name}</h1>
					{project.description && (
						<p className={style.projectDetail__description}>{project.description}</p>
					)}

					{/* Action buttons */}
					<div className={style.projectDetail__actions}>
						{liveUrl && (
							<a
								href={liveUrl}
								target="_blank"
								rel="noopener noreferrer"
								className={`${style.projectDetail__button} ${style["projectDetail__button--primary"]}`}
							>
								View Live Project
							</a>
						)}
						{repositoryUrl && (
							<a
								href={repositoryUrl}
								target="_blank"
								rel="noopener noreferrer"
								className={`${style.projectDetail__button} ${style["projectDetail__button--secondary"]}`}
							>
								View Code
							</a>
						)}
					</div>
				</div>

				{/* Hero element / image */}
				{heroElement && <div className={style.projectDetail__heroElement}>{heroElement}</div>}
			</header>

			{/* Main content */}
			<main className={style.projectDetail__content}>
				{/* About section */}
				{project.about && project.about.length > 0 && (
					<section className={style.projectDetail__section}>
						<h2 className={style.projectDetail__sectionTitle}>About This Project</h2>
						<ul className={style.projectDetail__list}>
							{project.about.map((detail, index) => (
								<li key={index} className={style.projectDetail__listItem}>
									{detail}
								</li>
							))}
						</ul>
					</section>
				)}

				{/* Technologies */}
				{technologies.length > 0 && (
					<section className={style.projectDetail__section}>
						<h2 className={style.projectDetail__sectionTitle}>Technologies Used</h2>
						<div className={style.projectDetail__technologies}>
							{technologies.map((tech, index) => (
								<span key={index} className={style.projectDetail__technology}>
									{tech}
								</span>
							))}
						</div>
					</section>
				)}

				{/* Features */}
				{features.length > 0 && (
					<section className={style.projectDetail__section}>
						<h2 className={style.projectDetail__sectionTitle}>Key Features</h2>
						<ul className={style.projectDetail__list}>
							{features.map((feature, index) => (
								<li key={index} className={style.projectDetail__listItem}>
									{feature}
								</li>
							))}
						</ul>
					</section>
				)}

				{/* Challenges and Solutions */}
				{(challenges.length > 0 || solutions.length > 0) && (
					<section className={style.projectDetail__section}>
						<h2 className={style.projectDetail__sectionTitle}>Challenges & Solutions</h2>
						<div className={style.projectDetail__challengesSolutions}>
							{challenges.length > 0 && (
								<div className={style.projectDetail__challenges}>
									<h3 className={style.projectDetail__subsectionTitle}>Challenges</h3>
									<ul className={style.projectDetail__list}>
										{challenges.map((challenge, index) => (
											<li key={index} className={style.projectDetail__listItem}>
												{challenge}
											</li>
										))}
									</ul>
								</div>
							)}
							{solutions.length > 0 && (
								<div className={style.projectDetail__solutions}>
									<h3 className={style.projectDetail__subsectionTitle}>Solutions</h3>
									<ul className={style.projectDetail__list}>
										{solutions.map((solution, index) => (
											<li key={index} className={style.projectDetail__listItem}>
												{solution}
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</section>
				)}
			</main>
		</article>
	);
}
