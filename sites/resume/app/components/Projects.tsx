import type { ResumeProjectData } from "schemas";

interface Props {
	items: ResumeProjectData["items"];
}

export default function Projects({ items }: Props) {
	return (
		<div className="section">
			<h2 className="section__heading">Projects</h2>
			{items.map((project, index) => {
				return (
					<div className="section__item" key={index}>
						<div className="section__item__heading">
							<h3
								className="section__item__heading__project"
								data-testid={`resume.projects[${index}].name`}
							>
								{project.name}
							</h3>
						</div>
						<div className="section__item__subheading">
							<p
								className="section__item__subtitle"
								data-testid={`resume.projects[${index}].description`}
							>
								{project.description}
							</p>
						</div>
						<div className="section__item__content">
							<ul>
								{project.about.map((bullet, bulletIndex) => {
									return (
										<li
											key={bulletIndex}
											data-testid={`resume.projects[${index}].about[${bulletIndex}]`}
										>
											{bullet}
										</li>
									);
								})}
							</ul>
						</div>
					</div>
				);
			})}
		</div>
	);
}
