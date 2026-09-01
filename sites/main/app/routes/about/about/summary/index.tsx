import { Link } from "react-router";
import type { AboutMeData } from "../../../../../data/about-me";
import style from "../style.module.scss";

export const UserBlock = ({ aboutMe }: { aboutMe: AboutMeData }) => {
	return (
		<div className={style.userBlock}>
			<div
				className={style.userBlock__backgroundImage}
				style={{
					backgroundImage: "url('/um_mall.jpeg')",
					backgroundPosition: "50% 30%",
				}}
			/>
			<div className={style.userBlock__content}>
				<span>
					<picture>
						<img
							style={{
								objectPosition: "center top",
								objectFit: "cover",
								width: "90px",
								height: "90px",
							}}
							className={style.userBlock__content__headshot}
							decoding="sync"
							loading="eager"
							src={"headshot2.jpeg"}
							alt="Headshot of Connor Bray"
						/>
					</picture>
				</span>
				<div className={style.userBlock__content__name}>{aboutMe.name}</div>
				<div className={style.userBlock__content__title}>{aboutMe.title}</div>
				<Link
					to="https://resume.connorbray.net"
					target="_blank"
					rel="noopener noreferrer"
					className={style.userBlock__content__downloadButton}
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
};

export const InformationBlock = ({ aboutMe }: { aboutMe: AboutMeData }) => {
	return (
		<div className={style.information}>
			<h2 className={style.information__title}>Information</h2>
			<div className={style.information__content}>
				<div className={style.information__content__item}>
					<div className={style.information__content__item__key}>Location</div>
					<div className={style.information__content__item__value}>
						{aboutMe.location}
					</div>
				</div>
				<div className={style.information__content__item}>
					<div className={style.information__content__item__key}>
						Professional Experience
					</div>
					<div className={style.information__content__item__value}>4+ years</div>
				</div>
			</div>
		</div>
	);
};

export const SkillsBlock = ({ aboutMe: _ }: { aboutMe: AboutMeData }) => {
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
};
