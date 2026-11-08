// import Terminal from "#components/terminal";
import style from "./footer.module.scss";

export default function Footer() {
	// oxlint-disable-next-line react/purity -- The copyright year reflects the render date.
	const year = new Date().getFullYear();
	return (
		<footer className={style.footer}>
			<div className={style.footer__default}>{/* <Terminal /> */}</div>
			<div className={style.footer__fullscreen}>
				<p>© {year} Connor Bray. All rights reserved.</p>
			</div>
		</footer>
	);
}
