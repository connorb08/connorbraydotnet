import Terminal from "#components/terminal";
import style from "./footer.module.scss";

export default function Footer() {
	return (
		<footer className={style.footer}>
			<div className={style.footer__default}>{/* <Terminal /> */}</div>
			<div className={style.footer__fullscreen}>
				<p>© {new Date().getFullYear()} Connor Bray. All rights reserved.</p>
			</div>
		</footer>
	);
}
