import type { Resume } from "shared";
import type { Route } from "./+types/index";
import "./index.scss";

export function loader({ context }: Route.LoaderArgs): Resume {
	return {
		name: "Connor Bray",
		about: {
			phoneNumber: "(207) 272-6463",
			emailAddress: "connor@connorbray.net",
			location: "Portland, ME",
			languages: ["C#", "JavaScript/TypeScript", "Python", "SQL", "C"],
			technologies: ["Git", "React", "Terraform", "AWS", "Containerization"],
			interests: [
				"Distributed Computing",
				"Containerization",
				"Software Infrastructure",
			],
		},
		career: [
			{
				company: "Tyler Technologies",
				title: "Software Engineer",
				location: "Yarmouth, ME",
				startDate: "May 2021",
				endDate: "Present",
				about: [
					"Translated legacy codebase to C# .NET, improving code maintainability and scalability",
					"Designed and implemented end-to-end, unit, and regression tests to ensure functional parity with the original system",
					"Streamlined deployment infrastructure by automating key components of the CI/CD pipeline",
					"Collaborated with cross-functional teams to improve product modernization",
					"Oversaw a team of 3 engineers and an intern, providing mentorship and guidance on best practices",
					"Primary responsibility for product team's translation efforts, 3 million lines of code",
				],
			},
			{
				company: "UMaine Student Government",
				title: "President",
				location: "Orono, ME",
				startDate: "May 2022",
				endDate: "May 2023",
				about: [
					"Served as the chief executive of a 501(c)(3) non-profit managing an annual budget exceeding $1,000,000",
					"Supervised 20+ employees, including 10+ direct reports, and led a governance board of 40+ total members",
				],
			},
		],
		education: [
			{
				school: "University of Maine",
				location: "Orono, ME",
				degree: "B.S. Computer Science",
				endDate: "",
				about: [],
			},
		],
		projects: [
			{
				name: "connorbray.net",
				description:
					"Personal website showcasing resume, portfolio, and photography, built for performance and scalability.",
				about: [
					"Emphasized accessibility and speed with fully tested architecture (unit, integration, e2e)",
					"Resume generated using HTML/CSS and validated with JSON schema validation",
					"Technologies: TypeScript, React, Cloudflare Workers, Terraform, GitHub Actions, and Playwright",
				],
			},
			{
				name: "cumberland-foodstop.com",
				description:
					"Website for a local convenience store, featuring online ordering, product catalog, and store information.",
				about: [
					"Includes admin dashboard allowing for easy updates to product catalog and store information",
					"Technologies: TypeScript, Next.js, React, Cloudflare Workers, AWS S3, and Terraform",
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
								<p className="section__item__heading__location">
									{careerItem.location}
								</p>
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
								<p className="section__item__heading__location">
									{educationItem.location}
								</p>
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
								<div
									data-testid="education-about"
									className="section__item__content"
								>
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
								<a
									className="footer__content__link"
									href="https://connorbray.net"
								>
									connorbray.net
								</a>
							</p>
						</li>
						<li>
							<p>
								<b className="footer__content--bold">{"GitHub: "}</b>
								<a
									className="footer__content__link"
									href="https://github.com/connorb08"
								>
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
