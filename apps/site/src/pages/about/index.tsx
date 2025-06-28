import { memo, useState } from "react";
import { FaLinkedin as LinkedinIcon } from "react-icons/fa";
import { VscGithub as GithubIcon } from "react-icons/vsc";
import { Link } from "react-router";
import type { Resume } from "shared";
import style from "./style.module.scss";
import { InformationBlock, SkillsBlock, UserBlock } from "./summary";
import Leadership from "./tabs/leadership";
import Portfolio from "./tabs/portfolio";
import ResumeTab from "./tabs/resume";

interface Props {
	data: Resume;
	loading?: boolean;
	error?: Error | null;
}

export const About = memo((props: Props) => {
	const resume = props.data;
	const [tab, setTab] = useState<number>(0);
	const tab0 = () => setTab(0);
	const tab1 = () => setTab(1);
	const tab2 = () => setTab(2);
	const tab3 = () => setTab(3);

	return (
		<div className={style.container}>
			<div className={style.container__grid}>
				<div className={style.container__grid__left}>
					<UserBlock />
					<InformationBlock />
					<SkillsBlock />
				</div>
				<div className={style.container__grid__main}>
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
										<GithubIcon
											className={
												style.aboutBlock__content__iconList__link__icon
											}
										/>
									</Link>
								</li>
								<li>
									<Link
										to="https://www.linkedin.com/in/connor-bray/"
										className={style.aboutBlock__content__iconList__link}
										aria-label="LinkedIn"
									>
										<LinkedinIcon
											className={
												style.aboutBlock__content__iconList__link__icon
											}
										/>
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
					{tab === 0 ? (
						<ResumeTab
							career={resume.career}
							education={resume.education}
							loading={props.loading}
						/>
					) : tab === 1 ? (
						<Portfolio projects={resume.projects} />
					) : tab === 2 ? (
						<Leadership roles={[]} />
					) : null}
				</div>
			</div>
		</div>
	);
});

export default About;
