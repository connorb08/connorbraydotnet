import { useLocation } from "react-router";
import { IconLinkButton } from "#components/ui/buttons";
import type { IconName } from "#components/ui/icons";
import style from "./navbar.module.scss";

export const routes = [
	{
		id: "home",
		title: "Home",
		icon: "home",
		href: "/",
	},
	{
		id: "about",
		title: "About",
		icon: "about",
		href: "/about",
	},
	{
		id: "photos",
		title: "Photos",
		icon: "home",
		href: "/photos",
	},
] satisfies {
	id: string;
	title: string;
	icon: IconName;
	href: string;
}[];

export default function Navbar() {
	const location = useLocation();

	return (
		<div className={style.navbar}>
			<nav className={style.navbar__navigation}>
				{routes.map((route) => (
					<IconLinkButton
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
