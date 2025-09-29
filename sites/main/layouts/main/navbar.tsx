import { About, Camera, Folder, Home, Mail } from "components/icons";
import { LinkButton } from "components/ui/new-button";
import type { ReactNode } from "react";
import { useLocation } from "react-router";
import style from "./navbar.module.scss";

export const routes = [
	{
		id: "home",
		title: "Home",
		icon: <Home />,
		href: "/",
	},
	{
		id: "about",
		title: "About",
		icon: <About />,
		href: "/about",
	},
	{
		id: "projects",
		title: "Projects",
		icon: <Folder />,
		href: "/projects",
	},
	{
		id: "gallery",
		title: "Gallery",
		icon: <Camera />,
		href: "/gallery",
	},
	{
		id: "contact",
		title: "Contact",
		icon: <Mail />,
		href: "/contact",
	},
] satisfies {
	id: string;
	title: string;
	icon: ReactNode;
	href: string;
}[];

export default function Navbar() {
	const location = useLocation();

	return (
		<div className={style.navbar}>
			<nav className={style.navbar__navigation}>
				{routes.map((route) => (
					<LinkButton
						key={route.id}
						to={route.href}
						icon={route.icon}
						viewTransition={location.pathname !== route.href}
						prefetch="viewport"
						variant="ghost"
						color="primary"
					/>
				))}
			</nav>
		</div>
	);
}
