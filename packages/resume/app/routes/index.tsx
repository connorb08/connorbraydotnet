import type { IResumeData } from "#models";
import type { Route } from "./+types/index";
import "./style.scss";

export function loader({ context }: Route.LoaderArgs) {
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
					"Collaborated with President, Chancellor, Dean of Students, and Provost to develop campus goals",
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
				about: ["Student Body President"],
			},
		],
		projects: [],
	} as const satisfies IResumeData;
}

export default function Home({ loaderData: resume }: Route.ComponentProps) {
	return (
		<div className="container">
			<header className="header">
				<h1 className="header__title">{resume.name}</h1>
				<p className="header__subtitle">{`${resume.about.phoneNumber} | ${resume.about.emailAddress} | ${resume.about.location}`}</p>
			</header>
			<div className="section">
				<h2 className="section__heading">Experience</h2>
				{resume.career.map((careerItem, index) => {
					return (
						<div
							className="section__item"
							key={`${careerItem.company}-${careerItem.title}`}
						>
							<div className="section__item__heading">
								<h3 className="section__item__heading__company">
									{careerItem.company}
								</h3>
								<p className="section__item__heading__location">
									{careerItem.location}
								</p>
							</div>
							<div className="section__item__subheading">
								<p className="section__item__subtitle">{careerItem.title}</p>
								<p className="section__item__date">
									{`${careerItem.startDate} – ${careerItem.endDate}`}
								</p>
							</div>
							<div className="section__item__content">
								<ul>
									{careerItem.about.map((bullet) => {
										return <li key={bullet}>{bullet}</li>;
									})}
								</ul>
							</div>
						</div>
					);
				})}
			</div>
			<div className="section">
				<h2 className="section__heading">Education</h2>
				{resume.education.map((educationItem, index) => {
					return (
						<div
							className="section__item"
							key={`{educationItem.school}-${educationItem.degree}`}
						>
							<div className="section__item__heading">
								<h3 className="section__item__heading__school">
									{educationItem.school}
								</h3>
								<p className="section__item__heading__location">
									{educationItem.location}
								</p>
							</div>
							<div className="section__item__subheading">
								<p className="section__item__subtitle">
									{educationItem.degree}
								</p>
								<p className="section_item__date">{educationItem.endDate}</p>
							</div>
							<div className="section__item__content">
								<ul>
									{educationItem.about.map((bullet) => {
										return <li key={bullet}>{bullet}</li>;
									})}
								</ul>
							</div>
						</div>
					);
				})}
			</div>
			<div className="section">
				<h2 className="section__heading">Projects</h2>
				Projects
			</div>
			<div className="section">
				<h2 className="section__heading">Skills/Interests</h2>
				<ul>
					<li>
						<p>
							<span className="footer__content--bold">Languages: </span>
							{resume.about.languages.join(", ")}
						</p>
					</li>
					<li>
						<p>
							<span className="footer__content--bold">Technologies: </span>
							{resume.about.technologies.join(", ")}
						</p>
					</li>
					<li>
						<p>
							<span className="footer__content--bold">Interests: </span>
							{resume.about.interests.join(", ")}
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
