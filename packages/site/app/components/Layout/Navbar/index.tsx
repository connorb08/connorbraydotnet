import { memo, useState } from "react";
import { GrHomeOption } from "react-icons/gr";
import type { IconType } from "react-icons/lib";
import { RxChevronRight } from "react-icons/rx";
import { VscAccount } from "react-icons/vsc";
import { useLocation } from "react-router";
import IconButton from "../../IconButton";
import style from "./navbar.module.scss";

const routes = [
	{
		id: "home",
		title: "Home",
		icon: GrHomeOption,
		href: "/",
	},
	{
		id: "about",
		title: "About",
		icon: VscAccount,
		href: "/about",
	},
] satisfies {
	id: string;
	title: string;
	icon: IconType;
	href: string;
}[];

const Navbar = memo(() => {
	const location = useLocation();

	const [isOpen, setIsOpen] = useState(false);

	const toggleSidebar = () => {
		setIsOpen((prev) => !prev);
	};

	return (
		<div className={`${style.navbar} ${isOpen ? style.open : ""}`}>
			<nav className={style.navbar__content}>
				<IconButton
					Icon={RxChevronRight}
					onClick={toggleSidebar}
					className={`${style.navbar__content__button}${isOpen ? ` ${style["--sidebarOpen"]}` : ""}`}
				/>
				<nav className={style.navbar__content__navigation}>
					{routes.map((route) => (
						<IconButton
							key={route.id}
							as="link"
							Icon={route.icon}
							to={route.href}
							prefetch="viewport"
							viewTransition={location.pathname !== route.href}
							className={style.navbar__content__button}
						/>
					))}
				</nav>
			</nav>
		</div>
	);
});

export default Navbar;
