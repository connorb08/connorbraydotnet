import style from "./home.module.scss";

type Section = {
	title: string;
	content: string;
	href: string;
}

const sections: Section[] = [{
	title: "Professional Summary",
	content: "",
	href: ""
}, {
	title: "Site Architecture",
	content: "",
	href: ""
}, {
	title: "Photography",
	content: "",
	href: ""
}, {
	title: "Contact Me",
	content: "",
	href: ""
}];
const projects = [{}, {}, {}, {}];

function Home() {
	return (
		<div className={style.home}>
			<div className={style.hero}>
				<h2 className={style.hero__title}>Connor Bray</h2>
				<p className={style.hero__subtitle}>Software Engineer</p>
				<p className={style.hero__content}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
							eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
							enim ad minim veniam, quis nostrud exercitation ullamco laboris
							nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
							reprehenderit in voluptate velit esse <span>...learn more</span></p>
				<button>Professional Summary</button>
			</div>
			<div className={style.content}>
				{sections.map((section, index) => (
					<section key={index} className={style.section}>
						<h2 className={style.section__title}>{section.title}</h2>
						<p className={style.section__content}>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
							eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
							enim ad minim veniam, quis nostrud exercitation ullamco laboris
							nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
							reprehenderit in voluptate velit esse
						</p>
					</section>
				))}
			</div>
			<div className={style.projects}>
				<h2 className={style.projects__header}>Projects & Skills</h2>
				<p>List highlighted projects and best skills</p>
				<p>Button to view more / all</p>
			</div>
			<div className={style.projects}>
				<h2 className={style.projects__header}>Links</h2>
				<p>LinkedIn</p>
				<p>GitHub</p>
			</div>
			<div className={style.projects}>
				<h2 className={style.projects__header}>Projects</h2>
				<div className={style.projects__content}>
				{projects.map((_, index) => (
					<div key={index} className={style.projects__content__projectItem}>
						Project {index + 1}
					</div>
				))}
				</div>
			</div>
			<div className={style.projects}>
				<h2 className={style.projects__header}>Skills</h2>
				<div className={style.projects__content}>
				{projects.map((_, index) => (
					<div key={index} className={style.projects__content__projectItem}>
						Project {index + 1}
					</div>
				))}
				</div>
			</div>
		</div>
	);
}

export default Home;
