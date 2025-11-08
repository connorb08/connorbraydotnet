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
			languages: ["C#", "TypeScript/JavaScript", "Python", "SQL", "C"],
			technologies: ["Git", "Docker", "Terraform", "AWS", "CI/CD"],
			interests: ["Distributed Computing", "Containerization", "Software Infrastructure"],
			summary:
				"Software engineer with 3+ years of experience building scalable, high-performance applications and improving developer workflows. Passionate about modernizing legacy systems and optimizing processes to enhance efficiency and reliability.",
		},
		career: [
			{
				company: "Tyler Technologies",
				title: "Software Engineer",
				location: "Yarmouth, ME",
				startDate: "May 2021",
				endDate: "Present",
				about: [
					"Implemented multi-tenant architecture and concurrency optimizations in the E2E test runner, cutting execution time from 3 days to under 1 day (5x faster) and enabling scalable performance.",
					"Partnered with cross-functional teams to improve project organization and developer workflows in large-scale greenfield projects, increasing developer velocity and reducing onboarding friction.",
					"Led modernization of 3M+ lines of legacy code to a modern .NET stack, ensuring maintainability, performance, and functional parity.",
					"Built unit, regression, and E2E tests that reduced defects and safeguarded product stability.",
					"Mentored a team of 3+ engineers, introducing coding standards and best practices that improved code quality and team efficiency.",
					"Automated deployment pipelines, reducing manual steps and minimizing release errors.",
					"Automated deployment pipelines, reducing manual steps and minimizing release errors.",
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
				description: "Automated solver for daily linkedin n-queens puzzle",
				about: [
					"Built an undirected graph-based and used constraint propagation to efficiently reduce search space.",
					"Deployed to AWS Lambda and Cloudflare Workers to run daily and publish results.",
					"Technologies: TypeScript, Playwright, AWS S3/Lambda, Cloudflare Workers.",
				],
			},
			{
				name: "cumberland-foodstop.com",
				description: "Customer-facing website for local restaurant & convenience store",
				about: [
					"Designed and deployed a responsive web app, improving online visibility and customer access.",
					"Implemented TypeScript-based front end and cloud hosting via Cloudflare.",
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
			<div className="section" id="summary">
				<h2 className="section__heading">Summary</h2>
				<p className="section__content" data-testid="resume.about.summary">
					{resume.about.summary}
				</p>
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
