import Terminal from "#components/terminal";
import style from "./footer.module.scss";

interface Props {
	showTerminal?: boolean;
}

export default function Footer({ showTerminal }: Props) {
	return (
		<footer className={style.footer}>
			{showTerminal ? (
				<Terminal />
			) : null
			// <div className={style.footer__content}>
			// 	<p className={style.footer__content__text}>
			// 		© {new Date().getFullYear()} Connor Bray. All rights reserved.
			// 	</p>
			// </div>
			}
		</footer>
	);
}
