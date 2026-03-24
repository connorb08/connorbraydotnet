import type { ResumeEducationData } from "schemas";

interface Props {
	items: ResumeEducationData["items"];
}

export default function Education({ items }: Props) {
	return (
		<div className="section">
			<h2 className="section__heading">Education</h2>
			{items.map((educationItem, index) => {
				return (
					<div className="section__item" key={index}>
						<div className="section__item__heading">
							<h3
								className="section__item__heading__school"
								data-testid={`resume.education[${index}].school`}
							>
								{educationItem.school}
							</h3>
							<p className="section__item__heading__location">{educationItem.location}</p>
						</div>
						<div className="section__item__subheading">
							<p
								className="section__item__subtitle"
								data-testid={`resume.education[${index}].degree`}
							>
								{educationItem.degree}
							</p>
							<p className="section__item__date">{educationItem.endDate}</p>
						</div>
						<div className="section__item__content">
							<ul>
								{educationItem.about.map((bullet, bulletIndex) => {
									return (
										<li
											key={bulletIndex}
											data-testid={`resume.education[${index}].about[${bulletIndex}]`}
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
