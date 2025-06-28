import Terminal from "#components/Terminal";
import style from "./footer.module.scss";

interface Props {
	showTerminal?: boolean;
}

export default function Footer({ showTerminal }: Props) {
	return (
		<footer className={style.footer}>
			{showTerminal ? (
				<Terminal />
			) : (
				<div className={style.footer__content}>
					<p className={style.footer__content__text}>
						© 2023 Connor Bray. All rights reserved.
					</p>
				</div>
			)}
		</footer>
	);
}
