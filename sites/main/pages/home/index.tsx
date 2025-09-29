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
		content:
			"Learn more about my background, experience, and technical skills. Discover my journey as a software engineer and the technologies I work with daily.",
		href: "/about",
	},
	{
		title: "Projects",
		content:
			"Explore a collection of my recent work, including web applications, open-source contributions, and personal projects that showcase my development skills.",
		href: "/projects",
	},
	{
		title: "Photography",
		content:
			"Dive into the visual journey through my photography. Explore landscapes, cityscapes, and candid moments captured through my lens.",
		href: "/gallery",
	},
	{
		title: "Contact",
		content:
			"Get in touch with me for collaborations, inquiries, or just to say hello. I'm always open to connecting with fellow professionals and enthusiasts.",
		href: "/contact",
	},
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
						<p className={style.hero__main__subtitle}>Full-Stack Software Engineer</p>
						<p className={style.hero__main__content}>
							Passionate software engineer with expertise in modern web technologies, cloud
							architecture, and scalable solutions. I specialize in building robust applications
							that deliver exceptional user experiences while maintaining clean, maintainable code.
						</p>
					</div>
				</div>
			</div>
			<div className={style.content}>
				{sections.map((section, index) => (
					<NavLink to={section.href} key={index} viewTransition>
						<section className={style.section}>
							<h2 className={style.section__title}>{section.title}</h2>
							<p className={style.section__content}>{section.content}</p>
						</section>
					</NavLink>
				))}
			</div>
		</div>
	);
}

export default Home;
