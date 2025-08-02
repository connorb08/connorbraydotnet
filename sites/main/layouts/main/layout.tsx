import Toolbar from "components/toolbar";
import { NavLink, Outlet, useLocation } from "react-router";
import Footer from "./footer";
import style from "./layout.module.scss";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

export function MainLayout() {
	const location = useLocation();
	return (
		<div className={style.layout}>
			<header className={style.header}>
				<span className={style.header__main}>
					<NavLink
						to="/"
						className={style.header__main__link}
						viewTransition={location.pathname !== "/"}
					>
						<span className={style.header__main__link__icon}>&gt;</span>
						<span className={style.header__main__link__text}>connor_bray</span>
						<span className={style.header__main__link__cursor}>_</span>
					</NavLink>
				</span>
			</header>
			<div className={style.container}>
				<Navbar />
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
