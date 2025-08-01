import { useState } from "react";
import { Link, Outlet } from "react-router";
import Toolbar from "#components/toolbar";
import { IconButton as IconButton2 } from "#components/ui/buttons";
import Footer from "./footer";
import style from "./layout.module.scss";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

export function MainLayout() {
	const [navbarOpen, setNavbarOpen] = useState(false);
	const toggleNavbar = () => {
		setNavbarOpen((prev) => !prev);
	};

	return (
		<div className={style.layout}>
			<header className={style.header}>
				<IconButton2
					onClick={toggleNavbar}
					className={`${style.header__navbarButton}${navbarOpen ? ` ${style["--navbarOpen"]}` : ""}`}
					icon="chevron"
				/>
				<span className={style.header__main}>
					<Link to="/" className={style.header__main__link}>
						<span className={style.header__main__link__icon}>&gt;</span>
						<span className={style.header__main__link__text}>connor_bray</span>
						<span className={style.header__main__link__cursor}>_</span>
					</Link>
				</span>
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
			<Footer />
			<Toolbar />
		</div>
	);
}

export default MainLayout;
