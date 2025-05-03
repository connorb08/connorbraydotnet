import type { PropsWithChildren } from "react";
import { memo, type SVGAttributes } from "react";

interface SvgIconProps {
	title: string;
	role: SVGAttributes<SVGSVGElement>["role"];
	viewBox: SVGAttributes<SVGSVGElement>["viewBox"];
	className?: SVGAttributes<SVGSVGElement>["className"];
}

const SvgIcon = memo((props: PropsWithChildren<SvgIconProps>) => {
	return (
		<svg
			className={props.className}
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			role={props.role}
			fill={"currentColor"}
			viewBox={props.viewBox}
		>
			<title>{props.title}</title>
			{props.children}
		</svg>
	);
});

export default SvgIcon;
