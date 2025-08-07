import { NavLink } from "react-router";
import style from "./home.module.scss";

type Section = {
	title: string;
	content: string;
	href: string;
};

const sections: Section[] = [
	{
		title: "Professional Summary",
		content: "",
		href: "/about",
	},
	{
		title: "Projects",
		content: "",
		href: "/projects",
	},
	{
		title: "Site Architecture",
		content: "",
		href: "/architecture",
	},
	{
		title: "Photography",
		content: "",
		href: "",
	},
	// {
	// 	title: "Contact Me",
	// 	content: "",
	// 	href: "",
	// },
	// {
	// 	title: "???",
	// 	content: "",
	// 	href: "",
	// },
];

function Home() {
	return (
		<div className={style.home}>
			<div className={style.hero}>
				<div className={style.hero__container}>
					<picture className={style.hero__image}>
						<img src="/headshot.jpeg" alt="Connor Bray - Software Engineer" />
					</picture>

					<div className={style.hero__main}>
						<h1 className={style.hero__main__title}>Connor Bray</h1>
						<p className={style.hero__main__subtitle}>
							Full-Stack Software Engineer
						</p>
						<p className={style.hero__main__content}>
							Passionate software engineer with expertise in modern web
							technologies, cloud architecture, and scalable solutions. I
							specialize in building robust applications that deliver
							exceptional user experiences while maintaining clean, maintainable
							code.
						</p>
						{/* <button type="button">View Professional Summary</button> */}
					</div>
				</div>
			</div>
			<div className={style.content}>
				{sections.map((section, index) => (
					<NavLink to={section.href} key={index} viewTransition>
						<section className={style.section}>
							<h2 className={style.section__title}>{section.title}</h2>
							<p className={style.section__content}>
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
								eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
								enim ad minim veniam, quis nostrud exercitation ullamco laboris
								nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
								in reprehenderit in voluptate velit esse
							</p>
						</section>
					</NavLink>
				))}
			</div>
			<div className={style.projects}>
				<h2 className={style.projects__header}>Contact Me</h2>
				<p>Social Links and whatnot</p>
				<p>Contact Form</p>
			</div>
		</div>
	);
}

export default Home;
