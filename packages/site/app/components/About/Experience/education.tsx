import { CiLocationOn } from "react-icons/ci";
import { FaGraduationCap, FaRegCalendar } from "react-icons/fa";
import type { ResumeEducation } from "shared";
import style from "./style.module.scss";

interface EducationProps extends ResumeEducation {
	icon_url?: string | undefined;
}

function getDateString(startDate?: string, endDate?: string) {
	if (!endDate) {
		return "";
	}

	if (!startDate) {
		return endDate;
	}

	return `${startDate} – ${endDate}`;
}

export default function Education(education: EducationProps) {
	const dateString = getDateString(education.startDate, education.endDate);

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
				<h3 className={style.educationItem__content__heading}>
					{education.degree}
				</h3>
				<div className={style.educationItem__content__subheading}>
					<div className={style.educationItem__content__subheading__school}>
						<FaGraduationCap />
						<span>{education.school}</span>
					</div>
					<div className={style.educationItem__content__subheading__location}>
						<CiLocationOn />
						<span>{education.location}</span>
					</div>
					{dateString !== "" ? (
						<div className={style.educationItem__content__subheading__date}>
							<FaRegCalendar />
							<span>{dateString}</span>
						</div>
					) : null}
				</div>
				<div className={style.educationItem__content__description}>
					{education.about?.join(", ")}
				</div>
			</div>
		</div>
	);
}
