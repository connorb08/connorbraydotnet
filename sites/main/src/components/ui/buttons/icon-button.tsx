import {
	type ButtonProps as AriaButtonProps,
	Button,
} from "react-aria-components";
import { type IconName, icons } from "../icons";
import style from "./button.module.scss";
import type { ButtonStyle } from "./types";

type IconButtonProps = AriaButtonProps &
	ButtonStyle & {
		icon?: IconName;
	};

function IconButton(props: IconButtonProps) {
	return (
		<Button
			{...props}
			className={`${style.iconButton}${props.className ? ` ${props.className}` : ""}`}
		>
			{props.icon && icons(props.icon, style.iconButton__icon)}
		</Button>
	);
}
export { IconButton };
