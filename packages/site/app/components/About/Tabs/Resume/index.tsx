import { Fragment, memo } from "react";
import type { ResumeCareer, ResumeEducation } from "shared";
import Career from "./Career";
import Education, { EducationSkeleton } from "./Education";
import style from "./style.module.scss";

interface ExperienceProps {
	career: ResumeCareer[];
	education: ResumeEducation[];
	loading?: boolean;
}

const Experience = memo((props: ExperienceProps) => {
	const bottomBorder = <div className={style.bottomBorder} />;

	return (
		<Fragment>
			<div className={style.section}>
				<h2 className={style.section__title}>Education</h2>
				{props.loading ? (
					<EducationSkeleton />
				) : (
					props.education.map((data, index) => {
						return <Education data={data} key={index} />;
					})
				)}
			</div>
			<div className={style.section}>
				<h2 className={style.section__title}>Experience</h2>
				{props.loading
					? Array.from({ length: 3 }, (_, index) => (
							<Fragment key={index}>
								<EducationSkeleton />
								{index !== props.career.length - 1 ? bottomBorder : ""}
							</Fragment>
						))
					: props.career.map((job, index) => {
							return (
								<Fragment key={index}>
									<Career data={job} />
									{index !== props.career.length - 1 ? bottomBorder : ""}
								</Fragment>
							);
						})}
			</div>
		</Fragment>
	);
});

export default Experience;
