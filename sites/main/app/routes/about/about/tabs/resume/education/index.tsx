import { CiLocationOn } from "react-icons/ci";
import { FaGraduationCap, FaRegCalendar } from "react-icons/fa";
import type { ResumeEducation } from "shared";
import style from "../style.module.scss";

type Props = {
	icon_url?: string | undefined;
	data: ResumeEducation;
};

export function getDateString(startDate?: string, endDate?: string) {
	if (!endDate) {
		return "";
	}

	if (!startDate) {
		return endDate;
	}

	return `${startDate} – ${endDate}`;
}

export default function Education({ data }: Props) {
	const dateString = getDateString(data.startDate, data.endDate);

	return (
		<div className={style.educationItem}>
			<div
				className={style.educationItem__schoolLogo}
				style={{
					backgroundPosition: "center",
					backgroundSize: "cover",
					backgroundImage: `url("https://content.connorbray.net/images/maine.png")`,
				}}
			/>

			<div className={style.educationItem__content}>
				<h3 className={style.educationItem__content__heading}>{data.degree}</h3>
				<div className={style.educationItem__content__subheading}>
					<div className={style.educationItem__content__subheading__school}>
						<FaGraduationCap />
						<span>{data.school}</span>
					</div>
					<div className={style.educationItem__content__subheading__location}>
						<CiLocationOn />
						<span>{data.location}</span>
					</div>
					{dateString !== "" ? (
						<div className={style.educationItem__content__subheading__date}>
							<FaRegCalendar />
							<span>{dateString}</span>
						</div>
					) : null}
				</div>
				<div className={style.educationItem__content__description}>
					<ul>
						{data.about?.map((item, index) => (
							<li key={index}>{item}</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}

export function EducationSkeleton() {
	return (
		<div className={`${style.educationItem}`} aria-busy="true">
			<div
				className={`${style.educationItem__schoolLogo} ${style.skeleton}`}
				style={{
					backgroundPosition: "center",
					backgroundSize: "cover",
				}}
			/>
			<div className={`${style.educationItem__content} ${style.skeleton}`}>
				<div className={style.educationItem__content__heading} />
				<div className={style.educationItem__content__subheading}>
					<div className={style.educationItem__content__subheading__school} />
					<div className={style.educationItem__content__subheading__location} />
					<div className={style.educationItem__content__subheading__date} />
				</div>
				<div className={style.educationItem__content__description} />
			</div>
		</div>
	);
}
