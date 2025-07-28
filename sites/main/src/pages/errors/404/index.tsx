import { NavLink } from "react-router";
import style from "./notfound.module.scss";

export default function NotFound() {
	return (
		<div className={style.notFound}>
			<h1 className={style.notFound__title}>404: Not Found</h1>
			<p className={style.notFound__message}>Looking for something?</p>
			<NavLink to="/" className={style.notFound__link} viewTransition>
				Return Home
			</NavLink>
		</div>
	);
}
