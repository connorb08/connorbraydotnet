import { GoGear } from "react-icons/go";
import { Link, Outlet } from "react-router";
import IconButton from "../IconButton";
import Footer from "./Footer";
import style from "./layout.module.scss";
import Navbar from "./Navbar";

export default function () {
	return (
		<div className={style.container}>
			<div className={style.layout}>
				<Navbar />
				<div className={style.layout__middleColumn}>
					<header className={style.layout__middleColumn__header}>
						<Link to="/" className={style.layout__middleColumn__header__logo}>
							<span
								className={style.layout__middleColumn__header__logo__prompt}
							>
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
				</div>
				<div className={style.layout__sideBar}>
					<IconButton
						Icon={GoGear}
						className={style.layout__sideBar__button}
						onClick={() => {
							const htmlElement = document.querySelector("html");
							if (htmlElement) {
								htmlElement.classList.replace("light", "dark") ||
									htmlElement.classList.replace("dark", "light");
							}
						}}
					/>
					{/* <button
						type="button"
						className={style.layout__sideBar__button}
						aria-label="settings"
						onClick={() => {
							const htmlElement = document.querySelector("html");
							if (htmlElement) {
								htmlElement.classList.replace("light", "dark") ||
									htmlElement.classList.replace("dark", "light");
							}
						}}
					>
						
						{/* <GearIcon className={style.layout__sideBar__button__icon} /> */
					/* </button>  */}
				</div>
			</div>
			<Footer />
		</div>
	);
}
