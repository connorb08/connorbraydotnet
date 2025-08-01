import { NavLink, type NavLinkProps } from "react-router";
import { type IconName, icons } from "../icons";
import style from "./button.module.scss";

export function LinkButton(
	props: NavLinkProps & React.RefAttributes<HTMLAnchorElement>,
) {
	return (
		<NavLink {...props} className={`${style.button} ${props.className}`}>
			{props.children}
		</NavLink>
	);
}

export function IconLinkButton(
	props: NavLinkProps &
		React.RefAttributes<HTMLAnchorElement> & {
			icon: React.ReactNode | IconName;
		},
) {
	return (
		<NavLink {...props} className={`${style.IconButton} ${props.className}`}>
			{typeof props.icon === "string"
				? icons(props.icon as IconName, style.iconButton__icon)
				: props.icon}
		</NavLink>
	);
}
