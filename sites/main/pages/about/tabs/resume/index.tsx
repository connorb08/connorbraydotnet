import { Fragment } from "react";
import type { Resume } from "shared";
import Career from "./career";
import Education, { EducationSkeleton } from "./education";
import style from "./style.module.scss";

type Props = {
	resume: Resume | Promise<Resume>;
};

const Experience = (props: Props) => {
	const bottomBorder = <div className={style.bottomBorder} />;

	return (
		<Fragment>
			<div className={style.section}>
				<h2 className={style.section__title}>Education</h2>
				{props.resume instanceof Promise ? (
					<EducationSkeleton />
				) : (
					props.resume.education.map((data, index) => {
						return <Education data={data} key={index} />;
					})
				)}
			</div>
			<div className={style.section}>
				<h2 className={style.section__title}>Experience</h2>
				{props.resume instanceof Promise
					? Array.from({ length: 3 }, (_, index) => (
							<Fragment key={index}>
								<EducationSkeleton />
								{index !== 3 - 1 ? bottomBorder : ""}
							</Fragment>
						))
					: props.resume.career.map((job, index, jobs) => {
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
