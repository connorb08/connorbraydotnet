import Terminal from "#components/terminal";
import style from "./footer.module.scss";

export default function Footer() {
	return (
		<footer className={style.footer}>
			<Terminal />
		</footer>
	);
}
