import type { PropsWithChildren } from "react";
import {
	type ButtonProps as AriaButtonProps,
	Button,
} from "react-aria-components";
import style from "./button.module.scss";
import type { ButtonStyle } from "./types";

type Props = AriaButtonProps & ButtonStyle;

function UIButton(props: PropsWithChildren<Props>) {
	return (
		<Button
			{...props}
			className={`${style.button}${props.className ? ` ${props.className}` : ""}`}
		>
			{props.children}
		</Button>
	);
}

export { UIButton as Button };
