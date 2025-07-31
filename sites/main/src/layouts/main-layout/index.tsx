import { useContext, useState } from "react";
import { GoGear } from "react-icons/go";
import { Link, Outlet } from "react-router";
import { IconButton as IconButton2 } from "#components/ui/button";
import IconButton from "#components/ui/icon-button";
import { toggleTheme } from "#utils";
import { GlobalContext, SettingsContext } from "#utils/context";
import Footer from "./footer";
import style from "./layout.module.scss";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

export function MainLayout() {
	const { rootRef } = useContext(GlobalContext);
	const {
		settings,
		setSettings: _,
		toggleFullscreen: __,
	} = useContext(SettingsContext);
	const [navbarOpen, setNavbarOpen] = useState(false);
	const toggleNavbar = () => {
		setNavbarOpen((prev) => !prev);
	};

	return (
		<div className={style.layout}>
			<header
				className={style.header}
				style={{ display: settings.fullscreen ? "none" : undefined }}
			>
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
				<IconButton onClick={() => toggleTheme(rootRef)}>
					<GoGear />
				</IconButton>
			</header>
			<div className={style.container}>
				<Navbar open={navbarOpen} fullscreen={settings.fullscreen} />
				<div className={style.content} data-fullscreen={settings.fullscreen}>
					<main className={style.content__main}>
						<Outlet />
					</main>
				</div>
				<Sidebar fullscreen={settings.fullscreen} />
			</div>
			<Footer
				showTerminal={settings.showTerminal}
				fullscreen={settings.fullscreen}
			/>
		</div>
	);
}

export default MainLayout;
