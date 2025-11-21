import { type ButtonProps as AriaButtonProps, Button } from "react-aria-components";
import { type IconName, icons } from "../icons";
import style from "./buttons.module.scss";
import type { ButtonStyle } from "./types";

type IconButtonProps = AriaButtonProps &
	ButtonStyle & {
		icon?: IconName;
	};

function IconButton(props: IconButtonProps) {
	return (
		<Button
			{...props}
			className={`${style.button} ${props.color ? style[`color--${props.color}`] : ""} ${props.variant ? style[`variant--${props.variant}`] : ""} ${props.className}`}
		>
			{props.icon && icons(props.icon, style.button__icon)}
		</Button>
	);
}
export { IconButton };
