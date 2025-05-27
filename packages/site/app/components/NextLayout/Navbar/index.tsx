import { memo, type ReactNode, useState } from "react";
import { VscAccount, VscHome } from "react-icons/vsc";
import { NavLink, useLocation } from "react-router";
import { SidebarIcon } from "#components/SvgIcon";
import style from "../layout.module.scss";

const routes = [
	{
		id: "home",
		title: "Home",
		icon: (className?: string | undefined) => <VscHome className={className} />,
		href: "/",
	},
	{
		id: "about",
		title: "About",
		icon: (className?: string | undefined) => (
			<VscAccount className={className} style={{ padding: "2px" }} />
		),
		href: "/about",
	},
] satisfies {
	id: string;
	title: string;
	icon: (className?: string | undefined) => ReactNode;
	href: string;
}[];

const Navbar = memo(() => {
	const location = useLocation();

	const [isOpen, setIsOpen] = useState(false);

	const toggleSidebar = () => {
		setIsOpen((prev) => !prev);
	};

	return (
		<div className={`${style.layout__sideBar} ${isOpen ? style.open : ""}`}>
			<div
				className={`${style.layout__sideBar__topBox} ${style["--marginLeft"]}`}
			>
				<button
					type="button"
					className={style.layout__sideBar__topBox__button}
					onClick={toggleSidebar}
				>
					<SidebarIcon
						className={`${style.layout__sideBar__topBox__button__icon}${isOpen ? ` ${style["--sidebarOpen"]}` : ""}`}
					/>
				</button>
			</div>
			<nav className={style.layout__sideBar__content}>
				<nav className={style.layout__sideBar__content__navigation}>
					{routes.map((route) => (
						<NavLink
							to={route.href}
							className={`${style.layout__sideBar__content__navigation__link}${isOpen ? ` ${style["--sidebarOpen"]}` : ""}`}
							key={route.id}
							prefetch="viewport"
							viewTransition={location.pathname !== route.href}
							// style={({ isActive }) => ({
							// 	pointerEvents: isActive ? "none" : "inherit",
							// })}
						>
							{route.icon(
								style.layout__sideBar__content__navigation__link__icon,
							)}
							<span
								className={`${style.layout__sideBar__content__navigation__link__text}${isOpen ? ` ${style["--sidebarOpen"]}` : ""}`}
							>
								{route.title}
							</span>
						</NavLink>
					))}
				</nav>
			</nav>
			<div className={style.layout__sideBar__bottomBox} />
		</div>
	);
});

export default Navbar;
