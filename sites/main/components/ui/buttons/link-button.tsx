import { NavLink, type NavLinkProps } from "react-router";
import { type IconName, icons } from "../icons";
import style from "./buttons.module.scss";
import type { ButtonStyle } from "./types";

export function LinkButton(
	props: NavLinkProps & React.RefAttributes<HTMLAnchorElement>,
) {
	return (
		<NavLink {...props} className={`${style.button} ${props.className}`}>
			{props.children}
		</NavLink>
	);
}
type IconButtonProps = NavLinkProps &
	React.RefAttributes<HTMLAnchorElement> &
	ButtonStyle & {
		icon: React.ReactNode | IconName;
	};

export function IconLinkButton(props: IconButtonProps) {
	return (
		<NavLink
			{...props}
			className={`${style.button} ${props.color ? style[`color--${props.color}`] : ""} ${props.variant ? style[`variant--${props.variant}`] : ""} ${props.className}`}
		>
			{typeof props.icon === "string"
				? icons(props.icon as IconName, style.button__icon)
				: props.icon}
		</NavLink>
	);
}
