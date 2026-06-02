import { LinkButton } from "../ui/buttons/button";
import { useLocation } from "react-router";
import { routes } from "./pages";
import style from "./style.module.scss";

export default function Navigation() {
	const location = useLocation();

	return (
		<div className={style.navbar}>
			<nav className={style.navbar__navigation}>
				{routes.map((route) => (
					<LinkButton
						key={route.id}
						to={route.href}
						icon={route.icon}
						viewTransition={location.pathname !== route.href}
						prefetch="viewport"
						variant="ghost"
						color="primary"
					/>
				))}
			</nav>
		</div>
	);
}

export { default as MobileNavigation } from "./mobile";
