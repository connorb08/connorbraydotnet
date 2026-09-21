import { Fragment } from "react";
import type { Resume } from "schemas";
import { Career } from "./career";
import Education, { EducationSkeleton } from "./education";
import style from "./style.module.scss";

type Props = {
	resume: Resume;
	loading: boolean;
};

type ResumeSection = Resume["sections"][number];

function isSectionTitled<Title extends ResumeSection["title"]>(title: Title) {
	return (section: ResumeSection): section is Extract<ResumeSection, { title: Title }> =>
		section.title === title;
}

const Experience = (props: Props) => {
	const bottomBorder = <div className={style.bottomBorder} />;

	const educationItems =
		props.resume.sections.find(isSectionTitled("Education"))?.items ?? [];
	const experienceItems =
		props.resume.sections.find(isSectionTitled("Experience"))?.items ?? [];

	return (
		<Fragment>
			<div className={style.section}>
				<h2 className={style.section__title}>Education</h2>
				{props.loading ? (
					<EducationSkeleton />
				) : (
					educationItems.map((data, index) => {
						return <Education data={data} key={index} />;
					})
				)}
			</div>
			<div className={style.section}>
				<h2 className={style.section__title}>Experience</h2>
				{props.loading
					? Array.from({ length: 1 }, (_, index) => (
							<Fragment key={index}>
								<EducationSkeleton />
								{index !== 1 - 1 ? bottomBorder : ""}
							</Fragment>
						))
					: experienceItems.map((job, index, jobs) => {
							return (
								<Fragment key={index}>
									<Career data={job} />
									{index !== jobs.length - 1 ? bottomBorder : ""}
								</Fragment>
							);
						})}
			</div>
		</Fragment>
	);
};

export default Experience;
