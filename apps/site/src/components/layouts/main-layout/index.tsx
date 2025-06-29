import { useContext, useState } from "react";
import { GoGear } from "react-icons/go";
import { RxChevronRight } from "react-icons/rx";
import { Link, Outlet } from "react-router";
import IconButton from "#components/ui/icon-button";
import { toggleTheme } from "#utils";
import { ProjectContext } from "#utils/context";
import Footer from "./footer";
import style from "./layout.module.scss";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

export function MainLayout() {
	const { rootRef } = useContext(ProjectContext);
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
					className={`${style.header__navbarButton}${navbarOpen ? ` ${style["--navbarOpen"]}` : ""}`}
				>
					<RxChevronRight />
				</IconButton>
				<span className={style.header__main}>
					<Link to="/" className={style.header__main__link}>
						<span className={style.header__main__link__icon}>&gt;</span>
						<span className={style.header__main__link__text}>connor_bray</span>
						<span className={style.header__main__link__cursor}>_</span>
					</Link>
				</span>
				<IconButton onClick={() => toggleTheme(rootRef)}>
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
