import { NavLink } from "react-router";
import type { Route } from "./+types/index";
import style from "./home.module.scss";

export function meta() {
	return [{ title: "Connor Bray" }, { name: "description", content: "connorbray.net" }];
}

const sections: {
	title: string;
	content: string;
	href: string;
}[] = [
	{
		title: "Professional Summary",
		content:
			"Here's a bit about my work experience and the tech I use every day. I've put together some info about my career path and the skills I've picked up along the way.",
		href: "/about",
	},
	{
		title: "Projects",
		content:
			"Take a look at what I've been working on lately. I've built some web apps, contributed to open-source, and tinkered with side projects that I'm pretty proud of.",
		href: "/projects",
	},
	{
		title: "Photography",
		content:
			"Photography is my creative outlet. I love capturing birds, nature, and other moments that catch my eye. Check out some of my favorite shots.",
		href: "/gallery",
	},
	{
		title: "Contact",
		content:
			"Want to chat? Feel free to reach out! Whether it's about work stuff, my projects, or just to say hi - I'm always happy to connect.",
		href: "/contact",
	},
];

export default function (_: Route.ComponentProps) {
	return (
		<div className={style.home}>
			<div className={style.hero}>
				<div className={style.hero__container}>
					<picture className={style.hero__image}>
						<img src="/headshot.jpeg" alt="Connor Bray - Software Engineer" />
					</picture>

					<div className={style.hero__main}>
						<h1 className={style.hero__main__title}>Connor Bray</h1>
						<p className={style.hero__main__subtitle}>Software Engineer</p>
						<div className={style.hero__main__content}>
							<p className={style.hero__main__content__paragraph}>
								I love building software that helps people in their daily lives. I'm
								passionate about web and cloud technologies, and enjoy solving real
								problems through code. From front-end design to backend services and
								CI/CD, I focus on creating things that work well and are accessible to
								everyone.
							</p>
							<p className={style.hero__main__content__paragraph}>
								Outside of work, I enjoy wildlife photography, staying active through gym
								workouts and hiking, and sharpening my mind with a game of chess.
							</p>
						</div>
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
