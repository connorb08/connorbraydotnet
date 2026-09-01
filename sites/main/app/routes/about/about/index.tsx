import { memo, useState } from "react";
import { FaLinkedin as LinkedinIcon } from "react-icons/fa";
import { VscGithub as GithubIcon } from "react-icons/vsc";
import { Link } from "react-router";
import type { Resume } from "shared";
import type { AboutMeData } from "../../../../data/about-me";
import style from "./style.module.scss";
import { InformationBlock, SkillsBlock, UserBlock } from "./summary";
import Leadership, { type LeadershipRole } from "./tabs/leadership";
import ResumeTab from "./tabs/resume";

type Props = {
	resume: Resume;
	leadershipRoles: LeadershipRole[];
	loading: boolean;
	aboutMe: AboutMeData;
};

const About = memo((props: Props) => {
	const [tab, setTab] = useState<number>(0);
	const tab0 = () => setTab(0);
	const tab1 = () => setTab(1);

	return (
		<div className={style.container}>
			<div className={style.container__grid}>
				<div className={style.container__grid__left}>
					<UserBlock aboutMe={props.aboutMe} />
					<InformationBlock aboutMe={props.aboutMe} />
					<SkillsBlock aboutMe={props.aboutMe} />
				</div>
				<div className={style.container__grid__main}>
					<div className={style.aboutBlock}>
						<h2 className={style.aboutBlock__title}>About me</h2>
						<p className={style.aboutBlock__description}>{props.aboutMe.summary}</p>

						<div className={style.aboutBlock__content}>
							<ul className={style.aboutBlock__content__iconList}>
								<li>
									<Link
										to={props.aboutMe.github}
										className={style.aboutBlock__content__iconList__link}
										aria-label="GitHub Profile"
									>
										<GithubIcon
											className={style.aboutBlock__content__iconList__link__icon}
										/>
									</Link>
								</li>
								<li>
									<Link
										to={props.aboutMe.linkedin}
										className={style.aboutBlock__content__iconList__link}
										aria-label="LinkedIn"
									>
										<LinkedinIcon
											className={style.aboutBlock__content__iconList__link__icon}
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
									Leadership
								</button>
							</li>
						</ul>
					</div>
					{tab === 0 ? (
						<ResumeTab resume={props.resume} loading={props.loading} />
					) : tab === 1 ? (
						<Leadership roles={props.leadershipRoles} />
					) : null}
				</div>
			</div>
		</div>
	);
});

export { About };
