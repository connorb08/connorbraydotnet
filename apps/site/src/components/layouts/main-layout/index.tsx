import { useState } from "react";
import { GoGear } from "react-icons/go";
import { RxChevronRight } from "react-icons/rx";
import { Link, Outlet } from "react-router";
import IconButton from "#components/ui/icon-button";
import { toggleTheme } from "#utils";
import Footer from "./footer";
import style from "./layout.module.scss";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

export function MainLayout() {
	const [showTerminal, _setShowTerminall] = useState<boolean>(true);
	const [navbarOpen, setNavbarOpen] = useState(false);
	const toggleNavbar = () => {
		setNavbarOpen((prev) => !prev);
	};

	return (
		<div className={style.layout}>
			<header className={style.header}>
				<IconButton
					onClick={toggleNavbar}
					className={`${style.header__navbarButton}${navbarOpen ? ` ${style["-navbarOpen"]}` : ""}`}
				>
					<RxChevronRight />
				</IconButton>
				<Link to="/" className={style.header__link}>
					<span className={style.header__link__icon}>&gt;</span>
					<span className={style.header__link__text}>connor_bray</span>
					<span className={style.header__link__cursor}>_</span>
				</Link>
				<IconButton onClick={toggleTheme}>
					<GoGear />
				</IconButton>
			</header>
			<div className={style.container}>
				<Navbar open={navbarOpen} />
				<div className={style.content}>
					<main className={style.content__main}>
						<Outlet />
					</main>
				</div>
				<Sidebar />
			</div>
			<Footer showTerminal={showTerminal} />
		</div>
	);
}

export default MainLayout;
