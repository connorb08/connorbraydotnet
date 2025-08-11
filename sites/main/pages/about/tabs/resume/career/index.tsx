import { CiLocationOn } from "react-icons/ci";
import { FaBriefcase, FaRegCalendar } from "react-icons/fa";
import type { ResumeCareer } from "shared";
import { getDateString } from "../education";
import style from "../style.module.scss";

type Props = {
	icon_url?: string | undefined;
	data: ResumeCareer;
};

export function Career({ data }: Props) {
	const dateString = getDateString(data.startDate, data.endDate);
	return (
		<div className={style.listItem}>
			<div
				className={style.listItem__logo}
				style={{
					backgroundPosition: "center",
					backgroundSize: "cover",
					backgroundImage: `url('https://content.connorbray.net/images/tyler.png')`,
				}}
			/>

			<div className={style.listItem__content}>
				<h3 className={style.listItem__content__heading}>{data.title}</h3>
				<div className={style.listItem__content__subheading}>
					<div className={style.listItem__content__subheading__company}>
						<FaBriefcase />
						<span>{data.company}</span>
					</div>
					<div className={style.listItem__content__subheading__location}>
						<CiLocationOn />
						<span>{data.location}</span>
					</div>
					{dateString !== "" ? (
						<div className={style.listItem__content__subheading__date}>
							<FaRegCalendar />
							<span>{dateString}</span>
						</div>
					) : null}
				</div>
				<div className={style.listItem__content__description}>
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

export default Career;
