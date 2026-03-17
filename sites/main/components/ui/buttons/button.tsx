import type { PropsWithChildren, ReactNode } from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import { NavLink, type NavLinkProps } from "react-router";
import style from "./button.module.scss";

type ButtonVariant = "normal" | "outline" | "ghost";
type ButtonColor = "primary" | "secondary" | "tertiary" | "error";
type ButtonSize = "small" | "medium" | "large";

type BaseButtonProps = {
	variant?: ButtonVariant;
	color?: ButtonColor;
	size?: ButtonSize;
	icon?: ReactNode;
	iconPosition?: "left" | "right";
	iconOnly?: boolean;
};

type ButtonProps = AriaButtonProps & BaseButtonProps;

// Shared logic for button styling and content rendering
function getButtonClasses(props: BaseButtonProps & { hasChildren?: boolean; className?: string }) {
	const { icon, iconOnly, hasChildren, className } = props;

	// Auto-detect icon-only mode: has icon but no children/text content
	const isIconOnly = iconOnly || (icon && !hasChildren);

	return [
		className,
		style.button,
		props.color ? style[`color--${props.color}`] : "",
		props.variant ? style[`variant--${props.variant}`] : "",
		props.size ? style[`size--${props.size}`] : "",
		isIconOnly ? style["icon-only"] : "",
		icon && hasChildren ? style["has-icon"] : "",
	]
		.filter(Boolean)
		.join(" ");
}

function renderButtonContent(
	icon?: ReactNode,
	iconPosition: "left" | "right" = "left",
	iconOnly?: boolean,
	hasChildren?: boolean,
	content?: ReactNode,
): ReactNode {
	// Auto-detect icon-only mode: has icon but no children/text content
	const isIconOnly = iconOnly || (icon && !hasChildren);

	if (isIconOnly) {
		return icon;
	}

	if (icon && content) {
		return iconPosition === "left" ? (
			<>
				<span className={style["icon-wrapper"]}>{icon}</span>
				<span className={style["text-wrapper"]}>{content}</span>
			</>
		) : (
			<>
				<span className={style["text-wrapper"]}>{content}</span>
				<span className={style["icon-wrapper"]}>{icon}</span>
			</>
		);
	}

	return content;
}

export function Button(props: ButtonProps) {
	const { icon, iconPosition = "left", iconOnly, children, className, ...restProps } = props;

	const resolvedClassName = typeof className === "function" ? undefined : className;
	const hasChildren = Boolean(children);

	return (
		<AriaButton
			{...restProps}
			className={getButtonClasses({ ...props, hasChildren, className: resolvedClassName })}
		>
			{(renderProps) => {
				const content = typeof children === "function" ? children(renderProps) : children;
				return renderButtonContent(icon, iconPosition, iconOnly, hasChildren, content);
			}}
		</AriaButton>
	);
}

type LinkButtonProps = NavLinkProps & BaseButtonProps;

export function LinkButton(props: PropsWithChildren<LinkButtonProps>) {
	const {
		icon,
		iconPosition = "left",
		iconOnly,
		children,
		className,
		viewTransition = true,
		...restProps
	} = props;

	const hasChildren = Boolean(children);
	const resolvedClassName = typeof className === "function" ? undefined : className;

	return (
		<NavLink
			{...restProps}
			className={getButtonClasses({ ...props, hasChildren, className: resolvedClassName })}
			// viewTransition={viewTransition}
		>
			{renderButtonContent(icon, iconPosition, iconOnly, hasChildren, children)}
		</NavLink>
	);
}
