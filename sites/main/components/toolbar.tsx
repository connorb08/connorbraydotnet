import { useContext } from "react";
import { toggleTheme } from "#utils";
import { GlobalContext } from "#utils/context";
import { ExitFullscreen, Fullscreen, Gear } from "./icons";
import style from "./toolbar.module.scss";
import { Button } from "./ui/new-button";

function ThemeToggle() {
	const { rootRef } = useContext(GlobalContext);
	return (
		<Button color="primary" variant="ghost" icon={<Gear />} onClick={() => toggleTheme(rootRef)} />
	);
}

function FullscreenToggle() {
	const { rootRef, toggleFullscreen } = useContext(GlobalContext);

	return (
		<>
			<Button
				color="primary"
				variant="ghost"
				className={style.exit}
				icon={<ExitFullscreen />}
				onClick={() => toggleFullscreen(rootRef)}
			/>
			<Button
				color="primary"
				variant="ghost"
				className={style.enter}
				icon={<Fullscreen />}
				onClick={() => toggleFullscreen(rootRef)}
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
