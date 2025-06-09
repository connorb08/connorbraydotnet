import { memo } from "react";
import { Link } from "react-router";
import { CONTENT_PATH } from "#app/config";
import style from "../style.module.scss";

// const EmploymentStatus = ({
// 	employmentStatus,
// }: {
// 	employmentStatus: AboutProps["employmentStatus"];
// }) => {
// 	let textColor: string;
// 	let bgColor: string;
// 	let text: string;

// 	if (employmentStatus === 1) {
// 		text = "Employed";
// 		bgColor = "bg-green-100";
// 		textColor = "text-green-600";
// 	} else if (employmentStatus === 0) {
// 		text = "Freelance";
// 		bgColor = "bg-gray-100";
// 		textColor = "text-neutral-600";
// 	} else {
// 		text = "Unemployed 😞";
// 		bgColor = "bg-red-100";
// 		textColor = "text-red-600";
// 	}

// 	return <span className={`status-badge ${textColor} ${bgColor}`}>{text}</span>;
// };

export const UserBlock = memo(() => {
	return (
		<div className={style.userBlock}>
			<div
				className={style.userBlock__backgroundImage}
				style={{
					backgroundImage:
						"url('https://connorbray.net/cdn-cgi/image/format=auto,quality=50,fit=scale-down,width=960/https://content.connorbray.net/images/um_mall.jpeg')",
				}}
			/>
			<div className={style.userBlock__content}>
				{/* <EmploymentStatus
                                    employmentStatus={props.employmentStatus}
                                /> */}
				<span>
					<picture>
						<img
							style={{
								objectPosition: "center top",
								objectFit: "cover",
								width: "90px",
								height: "90px",
							}}
							// className="user-photo"
							className={style.userBlock__content__headshot}
							decoding="sync"
							loading="eager"
							src={CONTENT_PATH("images/headshot.jpeg?size=sm")}
							alt="Headshot of Connor Bray"
						/>
					</picture>
				</span>
				<div className={style.userBlock__content__name}>Connor Bray</div>
				<div className={style.userBlock__content__title}>Software Engineer</div>
				<Link
					to="https://content.connorbray.net/resume.pdf"
					className={style.userBlock__content__downloadButton}
					reloadDocument
				>
					<span className={style.userBlock__content__downloadButton__text}>
						Download CV
					</span>
					<span className={style.userBlock__content__downloadButton__icon}>
						<svg
							className={style.userBlock__content__downloadButton__icon__svg}
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							focusable="false"
							aria-hidden="true"
						>
							<title>Download Icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="1.8"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							/>
						</svg>
					</span>
				</Link>
			</div>
		</div>
	);
});

export const InformationBlock = memo(() => {
	return (
		<div className={style.information}>
			<h2 className={style.information__title}>Information</h2>
			<div className={style.information__content}>
				<div className={style.information__content__item}>
					<div className={style.information__content__item__key}>Location</div>
					<div className={style.information__content__item__value}>
						Portland, ME
					</div>
				</div>
				<div className={style.information__content__item}>
					<div className={style.information__content__item__key}>
						Experience
					</div>
					<div className={style.information__content__item__value}>
						4+ years
					</div>
				</div>
			</div>
		</div>
	);
});

export const SkillsBlock = memo(() => {
	return (
		<div className={style.skills}>
			<h2 className={style.skills__title}>Skills</h2>
			<div className={style.skills__content}>
				<span className={style.skills__content__tag}>JavaScript</span>
				<span className={style.skills__content__tag}>React</span>
				<span className={style.skills__content__tag}>Web Development</span>
				<span className={style.skills__content__tag}>Python</span>
				<span className={style.skills__content__tag}>HTML/CSS</span>
				<span className={style.skills__content__tag}>C</span>
			</div>
		</div>
	);
});
