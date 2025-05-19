import { Fragment, memo } from "react";
import type { ResumeCareer, ResumeEducation } from "shared";
import Career from "./career";
import Education from "./education";
import style from "./style.module.scss";

interface ExperienceProps {
	career: ResumeCareer[];
	education: ResumeEducation[];
}

const Experience = memo((props: ExperienceProps) => {
	const bottomBorder = <div className={style.bottomBorder} />;

	return (
		<Fragment>
			<div className={style.section}>
				<h2 className={style.section__title}>Education</h2>
				{props.education.map((data, index) => {
					return <Education {...data} key={index} />;
				})}
			</div>
			<div className={style.section}>
				<h2 className={style.section__title}>Experience</h2>
				{props.career.map((job, index) => {
					return (
						<Fragment key={index}>
							<Career {...job} key={`${job}`} />
							{index !== props.career.length - 1 ? bottomBorder : ""}
						</Fragment>
					);
				})}
			</div>
		</Fragment>
	);
});

export default Experience;
