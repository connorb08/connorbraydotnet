import type { Route } from "./+types/index";
import "./index.scss";
import Education from "~/components/Education";
import Experience from "~/components/Experience";
import Projects from "~/components/Projects";
import { resumeData } from "~/data";

export function loader({ context: _context }: Route.LoaderArgs) {
	resumeData.sections.sort(
		(a, b) =>
			resumeData.options.order.indexOf(a.title) -
			resumeData.options.order.indexOf(b.title),
	);
	return resumeData;
}

export default function Index({ loaderData: resume }: Route.ComponentProps) {
	return (
		<div className="container">
			<header className="header">
				<h1 className="header__title" data-testid="resume.about.name">
					{resume.about.name}
				</h1>
				<p
					className="header__subtitle"
					data-testid="resume.contact"
				>{`${resume.about.phoneNumber} | ${resume.about.emailAddress} | ${resume.about.location}`}</p>
			</header>
			{resume.about.summary !== undefined && (
				<div className="section">
					<h2 className="section__heading">Summary</h2>
					<p className="section__content" data-testid="resume.about.summary">
						{resume.about.summary}
					</p>
				</div>
			)}
			<div className="section">
				<h2 className="section__heading">Skills</h2>
				<ul className="section__item">
					{resume.skills.map((skill) => (
						<li key={skill.skillName}>
							<p data-testid={`resume.about.${skill.skillName.toLowerCase()}`}>
								<span className="footer__content--bold">{skill.skillName}: </span>
								{skill.skillList.join(", ")}
							</p>
						</li>
					))}
				</ul>
			</div>
			{resume.sections.map((section) => {
				switch (section.title) {
					case "Experience": {
						return <Experience items={section.items} key={section.title} />;
					}
					case "Education": {
						return <Education items={section.items} key={section.title} />;
					}
					case "Projects": {
						return <Projects items={section.items} key={section.title} />;
					}
					default:
						return null;
				}
			})}
			<footer className="footer">
				<h2 className="footer__heading">Links</h2>
				<div className="footer__content">
					<ul className="footer__content__list">
						<li>
							<p>
								<b className="footer__content--bold">{"Website: "}</b>
								<a className="footer__content__link" href="https://connorbray.net">
									connorbray.net
								</a>
							</p>
						</li>
						<li>
							<p>
								<b className="footer__content--bold">{"GitHub: "}</b>
								<a className="footer__content__link" href="https://github.com/connorb08">
									github.com/connorb08
								</a>
							</p>
						</li>
						<li>
							<p>
								<b className="footer__content--bold">{"LinkedIn: "}</b>
								<a
									className="footer__content__link"
									href="https://linkedin.com/in/connor-bray"
								>
									linkedin.com/in/connor-bray
								</a>
							</p>
						</li>
					</ul>
				</div>
			</footer>
		</div>
	);
}
