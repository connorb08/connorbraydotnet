import type { Resume } from "shared";
import type { Route } from "./+types/index";
import "./index.scss";

export function loader({ context: _context }: Route.LoaderArgs) {
	return {
		name: "Connor Bray",
		about: {
			phoneNumber: "(207) 272-6463",
			emailAddress: "connor@connorbray.net",
			location: "Boston, MA",
			languages: ["C#", "JavaScript/TypeScript", "Python", "SQL", "C"],
			technologies: ["Git", "React", "Terraform", "AWS", "Docker"],
			interests: ["Distributed Computing", "Containerization", "Software Infrastructure"],
		},
		career: [
			{
				company: "Tyler Technologies",
				title: "Software Engineer",
				location: "Yarmouth, ME",
				startDate: "May 2021",
				endDate: "Present",
				about: [
					"Improved performance of E2E test runner by optimizing database connections and credential sharing",
					"Collaborated with multiple teams to improve project organization and developer experience",
					"Owned the modernization effort of a product team, responsible for the porting of 3 million lines of legacy code to a .NET stack",
					"Engineered comprehensive unit, regression, and end-to-end (E2E) tests to ensure functional parity",
					"Mentored and led a team of 3 engineers, establishing best practices to improve team performance and code quality",
				],
			},
		],
		education: [
			{
				school: "University of Maine",
				location: "Orono, ME",
				degree: "B.S. Computer Science",
				startDate: "",
				endDate: "",
				about: ["Student Body President"],
			},
		],
		projects: [
			{
				name: "Linkedin Queens",
				description: "Solver for daily linkedin n-queens puzzle",
				about: [
					"Creates an undirected graph representation of the n-queens puzzle and uses constraint propagation to reduce the search space until the solution is found",
					"Scheduled to execute daily and post results to linkedin-games.win",
					"Technologies: TypeScript, Playwright, AWS S3 / Lambda, Cloudflare Workers",
				],
			},
			{
				name: "E2E Test Runner",
				description:
					"Proof-of-concept E2E test runner for Tyler Technologies EERP next-gen product",
				about: [
					"Re-designed architecture to leverage multiple tenants, allowing increased test concurrency",
					"Refactored significant portions of codebase to implement DI to align with modern best practices",
					"Source code available at github.com/tyler-technologies/eerp-e2e-runner",
					"Technologies: .NET, Playwright, Xunit, RabbitMQ, Containerization",
				],
			},
		],
	} as const satisfies Resume;
}

export default function Index({ loaderData: resume }: Route.ComponentProps) {
	return (
		<div className="container">
			<header className="header">
				<h1 className="header__title" data-testid="resume.name">
					{resume.name}
				</h1>
				<p
					className="header__subtitle"
					data-testid="resume.contact"
				>{`${resume.about.phoneNumber} | ${resume.about.emailAddress} | ${resume.about.location}`}</p>
			</header>
			<div className="section" id="career">
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
			<div className="section" id="projects">
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
			</div>
			<div className="section" id="skills">
				<h2 className="section__heading">Skills/Interests</h2>
				<ul className="section__item">
					<li>
						<p data-testid="resume.about.languages">
							<span className="footer__content--bold">Languages: </span>
							{resume.about.languages.join(", ")}
						</p>
					</li>
					<li>
						<p data-testid="resume.about.technologies">
							<span className="footer__content--bold">Technologies: </span>
							{resume.about.technologies.join(", ")}
						</p>
					</li>
					<li>
						<p data-testid="resume.about.interests">
							<span className="footer__content--bold">Interests: </span>
							{resume.about.interests?.join(", ")}
						</p>
					</li>
				</ul>
			</div>
			<footer className="footer">
				<h2 className="footer__heading">Links</h2>
				<div className="footer__content">
					<ul>
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
