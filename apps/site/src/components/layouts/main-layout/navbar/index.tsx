import { memo, type ReactElement } from "react";
import { GrHomeOption } from "react-icons/gr";
import type { IconType } from "react-icons/lib";
import { VscAccount } from "react-icons/vsc";
import { useLocation } from "react-router";
import IconButton from "../../../ui/icon-button/index.js";
import style from "./navbar.module.scss";

const routes = [
	{
		id: "home",
		title: "Home",
		icon: <GrHomeOption />,
		href: "/",
	},
	{
		id: "about",
		title: "About",
		icon: <VscAccount />,
		href: "/about",
	},
	{
		id: "home2",
		title: "Home2",
		icon: <GrHomeOption />,
		href: "/",
	},
] satisfies {
	id: string;
	title: string;
	icon: ReactElement<IconType>;
	href: string;
}[];

interface NavbarProps {
	open?: boolean;
}

const Navbar = memo((props: NavbarProps) => {
	const location = useLocation();

	return (
		<div className={`${style.navbar} ${props.open ? style.open : ""}`}>
			<nav className={style.navbar__content}>
				<nav className={style.navbar__content__navigation}>
					{routes.map((route) => (
						<IconButton
							key={route.id}
							as="link"
							to={route.href}
							prefetch="viewport"
							viewTransition={location.pathname !== route.href}
							className={style.navbar__content__button}
						>
							{route.icon}
						</IconButton>
					))}
				</nav>
			</nav>
		</div>
	);
});

export default Navbar;
