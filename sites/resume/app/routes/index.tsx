import type { Route } from "./+types/index";
import "./index.scss";
import { resumeData } from "~/data";

export function loader({ context: _context }: Route.LoaderArgs) {
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
			<div className="section" id="summary">
				<h2 className="section__heading">Summary</h2>
				<p className="section__content" data-testid="resume.about.summary">
					{resume.about.summary}
				</p>
			</div>
			<div className="section" id="skills">
				<h2 className="section__heading">Skills</h2>
				<ul className="section__item">
					<li>
						<p data-testid="resume.about.languages">
							<span className="footer__content--bold">Languages: </span>
							{resume.skills.languages.join(", ")}
						</p>
					</li>
					<li>
						<p data-testid="resume.about.technologies">
							<span className="footer__content--bold">Technologies: </span>
							{resume.skills.technologies.join(", ")}
						</p>
					</li>
					<li>
						<p data-testid="resume.about.interests">
							<span className="footer__content--bold">Focus Areas: </span>
							{resume.skills.interests?.join(", ")}
						</p>
					</li>
				</ul>
			</div>
			<div className="section" id="experience">
				<h2 className="section__heading">Experience</h2>
				{resume.career.map((careerItem, index) => {
					return (
						<div className="section__item" key={index}>
							<div className="section__item__heading">
								<h3
									className="section__item__heading__company"
									data-testid={`resume.career[${index}].company`}
								>
									{careerItem.company}
								</h3>
								<p className="section__item__heading__location">{careerItem.location}</p>
							</div>
							<div className="section__item__subheading">
								<p
									className="section__item__subtitle"
									data-testid={`resume.career[${index}].title`}
								>
									{careerItem.title}
								</p>
								<p className="section__item__date">
									{`${careerItem.startDate} – ${careerItem.endDate}`}
								</p>
							</div>
							<div className="section__item__content">
								<ul>
									{careerItem.about.map((bullet, bulletIndex) => {
										return (
											<li
												key={bulletIndex}
												data-testid={`resume.career[${index}].about[${bulletIndex}]`}
											>
												{bullet}
											</li>
										);
									})}
								</ul>
							</div>
						</div>
					);
				})}
			</div>
			<div className="section" id="education">
				<h2 className="section__heading">Education</h2>
				{resume.education.map((educationItem, index) => {
					return (
						<div className="section__item" key={index}>
							<div className="section__item__heading">
								<h3
									className="section__item__heading__school"
									data-testid={`resume.education[${index}].school`}
								>
									{educationItem.school}
								</h3>
								<p className="section__item__heading__location">{educationItem.location}</p>
							</div>
							<div className="section__item__subheading">
								<p
									className="section__item__subtitle"
									data-testid={`resume.education[${index}].degree`}
								>
									{educationItem.degree}
								</p>
								<p className="section__item__date">{educationItem.endDate}</p>
							</div>
							{educationItem.about.length > 0 ? (
								<div data-testid="education-about" className="section__item__content">
									<ul>
										{educationItem.about.map((bullet, bulletIndex) => {
											return (
												<li
													key={bulletIndex}
													data-testid={`resume.education[${index}].about[${bulletIndex}]`}
												>
													{bullet}
												</li>
											);
										})}
									</ul>
								</div>
							) : null}
						</div>
					);
				})}
			</div>
			{/* <div className="section" id="projects">
				<h2 className="section__heading">Projects</h2>
				{resume.projects.map((project, index) => {
					return (
						<div className="section__item" key={index}>
							<div className="section__item__heading">
								<h3
									className="section__item__heading__project"
									data-testid={`resume.projects[${index}].name`}
								>
									{project.name}
								</h3>
							</div>
							<div className="section__item__subheading">
								<p
									className="section__item__subtitle"
									data-testid={`resume.projects[${index}].description`}
								>
									{project.description}
								</p>
							</div>
							<div className="section__item__content">
								<ul>
									{project.about.map((bullet, bulletIndex) => {
										return (
											<li
												key={bulletIndex}
												data-testid={`resume.projects[${index}].about[${bulletIndex}]`}
											>
												{bullet}
											</li>
										);
									})}
								</ul>
							</div>
						</div>
					);
				})}
			</div> */}
			{/* <div className="section" id="boards">
				<h2 className="section__heading">Boards</h2>
				{resume.boards.map((board, index) => {
					return (
						<div className="section__item" key={index}>
							<div className="section__item__heading">
								<h3
									className="section__item__heading__project"
									data-testid={`resume.boards[${index}].name`}
								>
									{board.name}
								</h3>
							</div>
							<div className="section__item__subheading">
								<p className="section__item__subtitle" data-testid={`resume.boards[${index}].role`}>
									{board.role}
								</p>
							</div>
							<div className="section__item__content">
								<ul>
									{board.about.map((bullet, bulletIndex) => {
										return (
											<li
												key={bulletIndex}
												data-testid={`resume.boards[${index}].about[${bulletIndex}]`}
											>
												{bullet}
											</li>
										);
									})}
								</ul>
							</div>
						</div>
					);
				})}
			</div> */}
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
								<a className="footer__content__link" href="https://linkedin.com/in/connor-bray">
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
