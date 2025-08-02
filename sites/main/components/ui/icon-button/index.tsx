import {
	type ComponentProps,
	cloneElement,
	isValidElement,
	type JSXElementConstructor,
	type PropsWithChildren,
	type ReactElement,
} from "react";
import { NavLink, type NavLinkProps } from "react-router";
import style from "./style.module.scss";

type Props = BaseProps & (ButtonProps | LinkProps);

type BaseProps = {
	// icon: IconType;
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
	props: PropsWithChildren<Props> = {
		// icon: VscCircle,
		as: "button",
		to: undefined,
	},
) {
	if (props.as === "link") {
		return (
			<NavLink {...props} className={`${style.button} ${props.className}`}>
				{isValidElement(props.children)
					? // biome-ignore lint/suspicious/noExplicitAny: allow any for generic component props
						cloneElement<ComponentProps<JSXElementConstructor<any>>>(
							props.children,
							{
								className: `${
									(props.children as ReactElement<{ className: string }>).props
										.className ?? ""
								} ${style.button__icon}`,
							},
						)
					: props.children}
			</NavLink>
		);
	}
	return (
		<button
			type="button"
			className={`${style.button} ${props.className}`}
			onClick={props.onClick}
		>
			{isValidElement(props.children)
				? // biome-ignore lint/suspicious/noExplicitAny: allow any for generic component props
					cloneElement<ComponentProps<JSXElementConstructor<any>>>(
						props.children,
						{
							className: `${
								(props.children as ReactElement<{ className: string }>).props
									.className ?? ""
							} ${style.button__icon}`,
						},
					)
				: props.children}
		</button>
	);
}
