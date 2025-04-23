import { Link } from "react-router";
import style from "./style.module.scss";

function Header() {
	return (
		<header className={style.header}>
			<div className={style.headerContent}>
				<Link to="/" className={style.logo}>
					<span className={style.prompt}>&gt;</span>
					<span className={style.logoText}>connor_bray</span>
					{/* <span className={style.cursor}>_</span> */}
				</Link>
				<nav className={style.nav}>
					<Link to="/" className={style.navLink}>
						~/home
					</Link>
					<Link to="/about" className={style.navLink}>
						~/about
					</Link>
					<Link to="/projects" className={style.navLink}>
						~/projects
					</Link>
					<Link to="/photos" className={style.navLink}>
						~/photos
					</Link>
				</nav>
			</div>
		</header>
	);
}

export default Header;
