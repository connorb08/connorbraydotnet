import type { IconType } from "react-icons/lib";
import { VscCircle } from "react-icons/vsc";
import { NavLink, type NavLinkProps } from "react-router";
import style from "./style.module.scss";

type Props = BaseProps & (ButtonProps | LinkProps);

type BaseProps = {
	Icon: IconType;
	className?: string;
	onClick?: () => void;
};

type ButtonProps = {
	as?: "button";
	to?: undefined;
};

type LinkProps = {
	as: "link";
	to: string;
} & NavLinkProps;

export default function IconButton(
	props: Props = {
		Icon: VscCircle,
		as: "button",
		to: undefined,
	},
) {
	if (props.as === "link") {
		return (
			<NavLink {...props} className={`${style.button} ${props.className}`}>
				<props.Icon className={style.button__icon} />
			</NavLink>
		);
	}
	return (
		<button
			type="button"
			className={`${style.button} ${props.className}`}
			onClick={props.onClick}
		>
			<props.Icon className={style.button__icon} />
		</button>
	);
}
