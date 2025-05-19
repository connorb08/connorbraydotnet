import { Link, Outlet } from "react-router";
import { GearIcon } from "../SvgIcon";
import Terminal from "../Terminal";
import style from "./layout.module.scss";
import Navbar from "./Navbar";

export default function () {
	return (
		<div className={style.layout}>
			<Navbar />
			<div className={style.layout__middleColumn}>
				<header className={style.layout__middleColumn__header}>
					<Link to="/" className={style.layout__middleColumn__header__logo}>
						<span className={style.layout__middleColumn__header__logo__prompt}>
							&gt;
						</span>
						<span className={style.layout__middleColumn__header__logo__text}>
							connor_bray
						</span>
						{/* <span className={style.layout__middleColumn__header__logo__cursor}>
							_
						</span> */}
					</Link>
				</header>
				<div className={style.layout__middleColumn__content}>
					<main className={style.layout__middleColumn__content__container}>
						<Outlet />
					</main>
				</div>
				<footer className={style.layout__middleColumn__footer}>
					<Terminal />
				</footer>
			</div>
			<div className={style.layout__sideBar}>
				<div className={style.layout__sideBar__topBox}>
					<button
						type="button"
						className={style.layout__sideBar__topBox__button}
						aria-label="settings"
						onClick={() => {
							const htmlElement = document.querySelector("html");
							if (htmlElement) {
								htmlElement.classList.replace("light", "dark") ||
									htmlElement.classList.replace("dark", "light");
							}
						}}
					>
						<GearIcon className={style.layout__sideBar__topBox__button__icon} />
					</button>
				</div>
				<div className={style.layout__sideBar__content}>{/* R */}</div>
				<div className={style.layout__sideBar__bottomBox} />
			</div>
		</div>
	);
}
