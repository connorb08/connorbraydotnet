import { LinkButton } from "../ui/buttons/button";
import { routes } from "./pages";
import style from "./style.module.scss";
import { useLocation } from "react-router";

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

import { default as MobileNavigation } from "./mobile";

export { MobileNavigation };
