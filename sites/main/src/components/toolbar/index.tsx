import style from "./style.module.scss";
import { ThemeToggle } from "./theme-toggle";
import { FullscreenToggle } from "./toggle-fullscreen";

export default function Toolbar() {
	return (
		<div className={style.toolbar}>
			<ThemeToggle />
			<FullscreenToggle />
		</div>
	);
}
