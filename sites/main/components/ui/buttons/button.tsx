import {
	type ButtonProps as AriaButtonProps,
	Button,
} from "react-aria-components";
import style from "./buttons.module.scss";
import type { ButtonStyle } from "./types";

type Props = AriaButtonProps & ButtonStyle;

function UIButton(props: Props) {
	return (
		<Button
			{...props}
			className={`${style.button} ${props.color ? style[`color--${props.color}`] : ""} ${props.variant ? style[`variant--${props.variant}`] : ""} ${props.className}`}
		>
			{props.children}
		</Button>
	);
}

export { UIButton as Button };
