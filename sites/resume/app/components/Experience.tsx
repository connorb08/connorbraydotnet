import type { ResumeExperienceData } from "schemas";

interface Props {
	items: ResumeExperienceData["items"];
}

export default function Experience({ items }: Props) {
	return (
		<div className="section">
			<h2 className="section__heading">Experience</h2>
			{items.map((job, index) => {
				return (
					<div className="section__item" key={index}>
						<div className="section__item__heading">
							<h3
								className="section__item__heading__company"
								data-testid={`resume.career[${index}].company`}
							>
								{job.company}
							</h3>
							<p className="section__item__heading__location">{job.location}</p>
						</div>
						<div className="section__item__subheading">
							<p className="section__item__subtitle" data-testid={`resume.career[${index}].title`}>
								{job.title}
							</p>
							<p className="section__item__date">{`${job.startDate} – ${job.endDate}`}</p>
						</div>
						<div className="section__item__content">
							<ul>
								{job.about.map((bullet, bulletIndex) => {
									return (
										<li
											key={bulletIndex}
											data-testid={`resume.career[${index}].about[${bulletIndex}]`}
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
