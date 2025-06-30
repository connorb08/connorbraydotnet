import { memo, type ReactElement } from "react";
import { GrHomeOption } from "react-icons/gr";
import type { IconType } from "react-icons/lib";
import { LuHouse } from "react-icons/lu";
import { VscAccount } from "react-icons/vsc";
import { useLocation } from "react-router";
import IconButton from "../../../components/ui/icon-button/index.js";
import style from "./navbar.module.scss";

const routes = [
	{
		id: "home",
		title: "Home",
		icon: <LuHouse />,
		href: "/",
	},
	{
		id: "about",
		title: "About",
		icon: <VscAccount />,
		href: "/about",
	},
	{
		id: "photos",
		title: "Photos",
		icon: <GrHomeOption />,
		href: "/photos",
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
		<div className={`${style.navbar} ${props.open ? style["--open"] : ""}`}>
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
