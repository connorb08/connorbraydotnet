import Terminal from "#components/terminal";
import style from "./footer.module.scss";

interface Props {
	showTerminal?: boolean;
	fullscreen?: boolean;
}

export default function Footer(props: Props) {
	return (
		<footer className={style.footer} data-fullscreen={props.fullscreen}>
			{props.showTerminal ? <Terminal /> : null}
		</footer>
	);
}
