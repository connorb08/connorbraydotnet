import { useContext } from "react";
import { GlobalContext } from "#utils/state/index";
import { ExitFullscreen, Fullscreen, Moon, Sun } from "./icons";
import style from "./toolbar.module.scss";
import { Button } from "./ui/new-button";

export default function Toolbar() {
	return (
		<div className={style.toolbar}>
			<ThemeToggle />
			<FullscreenToggle />
		</div>
	);
}

function ThemeToggle() {
	const { theme, toggleTheme } = useContext(GlobalContext);
	return (
		<Button
			color="primary"
			variant="ghost"
			icon={theme === "light" ? <Moon /> : <Sun />}
			onClick={() => toggleTheme()}
		/>
	);
}

function FullscreenToggle() {
	const { fullscreen, toggleFullscreen } = useContext(GlobalContext);

	return (
		<Button
			color="primary"
			variant="ghost"
			icon={fullscreen ? <ExitFullscreen /> : <Fullscreen />}
			onClick={() => toggleFullscreen()}
		/>
	);
}
