import { useFullscreen, useTheme } from "#utils/hooks";
import { ExitFullscreen, Fullscreen, Moon, Sun } from "../icons";
import { Button } from "../ui/new-button";
import style from "./toolbar.module.scss";

export default function Toolbar() {
	return (
		<div className={style.toolbar}>
			<ToggleThemeButton />
			<FullscreenToggle />
		</div>
	);
}

export function ToggleThemeButton() {
	const { theme, toggleTheme } = useTheme();
	return (
		<Button
			color="primary"
			variant="ghost"
			icon={theme === "light" ? <Moon /> : <Sun />}
			onClick={toggleTheme}
		/>
	);
}

function FullscreenToggle() {
	const { fullscreen, toggleFullscreen } = useFullscreen();

	return (
		<Button
			color="primary"
			variant="ghost"
			icon={fullscreen ? <ExitFullscreen /> : <Fullscreen />}
			onClick={() => toggleFullscreen()}
		/>
	);
}
