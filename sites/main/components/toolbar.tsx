import { useContext } from "react";
import { GlobalContext } from "#utils/context/index";
import { ExitFullscreen, Fullscreen, Moon, Sun } from "./icons";
import style from "./toolbar.module.scss";
import { Button } from "./ui/new-button";

function ThemeToggle() {
	const { toggleTheme } = useContext(GlobalContext);
	return (
		<>
			<Button
				color="primary"
				variant="ghost"
				icon={<Sun />}
				className={style.dark}
				onClick={() => toggleTheme()}
			/>
			<Button
				color="primary"
				variant="ghost"
				icon={<Moon />}
				className={style.light}
				onClick={() => toggleTheme()}
			/>
		</>
	);
}

function FullscreenToggle() {
	const { toggleFullscreen } = useContext(GlobalContext);

	return (
		<>
			<Button
				color="primary"
				variant="ghost"
				className={style.exit}
				icon={<ExitFullscreen />}
				onClick={() => toggleFullscreen()}
			/>
			<Button
				color="primary"
				variant="ghost"
				className={style.enter}
				icon={<Fullscreen />}
				onClick={() => toggleFullscreen()}
			/>
		</>
	);
}

export default function Toolbar() {
	return (
		<div className={style.toolbar}>
			<ThemeToggle />
			<FullscreenToggle />
		</div>
	);
}
