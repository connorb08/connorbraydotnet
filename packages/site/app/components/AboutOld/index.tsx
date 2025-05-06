import { useState } from "react";
import Experience from "./experience";
import Information from "./information";
import Leadership from "./leadership";
import Portfolio from "./portfolio";
import type { AboutProps } from "./types";
// import { GitHubLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons';
import "./style.css";
import { Link } from "react-router";
import style from "./style.module.scss";

// import { Link } from '@remix-run/react';

const EmploymentStatus = ({
	employmentStatus,
}: {
	employmentStatus: AboutProps["employmentStatus"];
}) => {
	let textColor: string;
	let bgColor: string;
	let text: string;

	if (employmentStatus === 1) {
		text = "Employed";
		bgColor = "bg-green-100";
		textColor = "text-green-600";
	} else if (employmentStatus === 0) {
		text = "Freelance";
		bgColor = "bg-gray-100";
		textColor = "text-neutral-600";
	} else {
		text = "Unemployed 😞";
		bgColor = "bg-red-100";
		textColor = "text-red-600";
	}

	return <span className={`status-badge ${textColor} ${bgColor}`}>{text}</span>;
};

export const About = (props: AboutProps) => {
	const [tab, setTab] = useState<number>(0);
	const tab0 = () => setTab(0);
	const tab1 = () => setTab(1);
	const tab2 = () => setTab(2);
	const tab3 = () => setTab(3);

	return (
		<div className={style.container}>
			{/* <div className="main-container"> */}
			<div className={style.container__grid}>
				<div className={style.container__grid__left}>
					{/* <!-- Start Left Side --> */}

					{
						//#region User Block
					}
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
										className="user-photo"
										decoding="sync"
										loading="eager"
										src="https://connorbray.net/cdn-cgi/image/format=auto,fit=scale-down,width=180/https://content.connorbray.net/images/headshot.jpeg"
										alt="Headshot of Connor Bray"
									/>
								</picture>
							</span>
							<div className={style.userBlock__content__name}>Connor Bray</div>
							<div className={style.userBlock__content__title}>
								Software Engineer
							</div>
							<Link
								to="https://content.connorbray.net/resume.pdf"
								className={style.userBlock__content__downloadButton}
							>
								<span
									className={style.userBlock__content__downloadButton__text}
								>
									Download CV
								</span>
								<span
									className={style.userBlock__content__downloadButton__icon}
								>
									<svg
										className={
											style.userBlock__content__downloadButton__icon__svg
										}
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
					{
						//#endregion User Block
					}

					<Information />

					{/* <!-- Start Skills Block --> */}
					<div className={style.skills}>
						<h2 className={style.skills__title}>Skills</h2>
						<div className={style.skills__content}>
							<span className={style.skills__content__tag}>JavaScript</span>
							<span className={style.skills__content__tag}>React</span>
							<span className={style.skills__content__tag}>
								Web Development
							</span>
							<span className={style.skills__content__tag}>Python</span>
							<span className={style.skills__content__tag}>HTML/CSS</span>
							<span className={style.skills__content__tag}>C</span>
						</div>
					</div>
					{/* <!-- End Skills Block --> */}
				</div>
				{/* <!-- End Left Side --> */}

				{/* <!-- Start Right Side --> */}
				<div className={style.container__grid__main}>
					{/* <div className="space-y-5 2"> */}
					{/* <!-- Start About Me Block --> */}
					<div className={style.aboutBlock}>
						<h2 className={style.aboutBlock__title}>About me</h2>
						<p className={style.aboutBlock__description}>
							I am a Software Engineer who has worked on a variety of projects.
							From small personal ones to large enterprise applications, I have
							over 8 years of total programming experience. I'm proficient in a
							variety of programming languages, including JavaScript, Python,
							and C. I'm always looking for new ways to improve the way things
							work, and I'm not afraid to take risks. I enjoy working with
							others to achieve common goals.
						</p>

						<div className={style.aboutBlock__content}>
							<ul className={style.aboutBlock__content__iconList}>
								<li>
									<Link
										to="https://github.com/connorb08"
										className={style.aboutBlock__content__iconList__link}
										aria-label="GitHub"
									>
										{/* <GitHubLogoIcon height={24} width={24} /> */}
										GH Logo
									</Link>
								</li>
								<li>
									<Link
										to="https://www.linkedin.com/in/connor-bray/"
										className={style.aboutBlock__content__iconList__link}
										aria-label="LinkedIn"
									>
										Linkedin logo
										{/* <LinkedInLogoIcon height={24} width={24} /> */}
									</Link>
								</li>
							</ul>
						</div>

						<div className={style.aboutBlock__divider} />

						<ul className={style.aboutBlock__menu}>
							<li>
								<button
									onClick={tab0}
									className={`${style.aboutBlock__menu__tab} ${tab === 0 ? style["--active"] : ""}`}
									type="button"
								>
									Resume
								</button>
							</li>
							<li>
								<button
									onClick={tab1}
									className={`${style.aboutBlock__menu__tab} ${tab === 1 ? style["--active"] : ""}`}
									type="button"
								>
									Portfolio
								</button>
							</li>
							<li>
								<button
									onClick={tab2}
									className={`${style.aboutBlock__menu__tab} ${tab === 2 ? style["--active"] : ""}`}
									type="button"
								>
									Leadership
								</button>
							</li>
							<li>
								<button
									onClick={tab3}
									className={`${style.aboutBlock__menu__tab} ${tab === 3 ? style["--active"] : ""}`}
									type="button"
								>
									Contact
								</button>
							</li>
						</ul>
					</div>
					{/* <!-- End About Me Block --> */}

					{/* <Experience
						jobs={props.jobs}
						education={props.education}
						style={{
							display: tab === 1 ? "block" : "none",
						}}
					/> */}
					{tab === 0 ? (
						<Experience jobs={props.jobs} education={props.education} />
					) : tab === 2 ? (
						<Portfolio projects={props.projects} />
					) : tab === 3 ? (
						<Leadership roles={props.leadership} />
					) : null}
				</div>
				{/* <!-- End Right Side --> */}
			</div>
		</div>
		// </div>
	);
};

export default About;
