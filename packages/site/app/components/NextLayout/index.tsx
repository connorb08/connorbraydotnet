import { memo, useState } from "react";
import { Link, Outlet } from "react-router";
import { GearIcon, HomeIcon } from "../SvgIcon";
import SidebarIcon from "../SvgIcon/sidebar";
import Terminal from "../Terminal";
import style from "./style.module.scss";

const LeftSidebar = memo(() => {
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
						className={style.layout__sideBar__topBox__button__icon}
					/>
				</button>
			</div>
			<nav className={style.layout__sideBar__content}>
				<nav className={style.layout__sideBar__content__navigation}>
					<Link
						to="/"
						className={style.layout__sideBar__content__navigation__link}
					>
						<HomeIcon
							className={style.layout__sideBar__content__navigation__link__icon}
						/>
					</Link>
				</nav>
			</nav>
			<div className={style.layout__sideBar__bottomBox} />
		</div>
	);
});

export default function () {
	return (
		<div className={style.layout}>
			<LeftSidebar />
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
						<GearIcon className={style.layout__sideBar__topBox__button_icon} />
					</button>
				</div>
				<div className={style.layout__sideBar__content}>{/* R */}</div>
				<div className={style.layout__sideBar__bottomBox} />
			</div>
		</div>
	);
}
