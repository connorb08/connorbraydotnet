import { useContext } from "react";
import { IconButton } from "#components/ui/buttons";
import { toggleTheme } from "#utils";
import { GlobalContext } from "#utils/context";
import style from "./toolbar.module.scss";

function ThemeToggle() {
	const { rootRef } = useContext(GlobalContext);
	return (
		<IconButton
			color="primary"
			variant="ghost"
			icon={"gear"}
			onClick={() => toggleTheme(rootRef)}
		/>
	);
}

function FullscreenToggle() {
	const { rootRef, toggleFullscreen } = useContext(GlobalContext);

	return (
		<>
			<IconButton
				color="primary"
				variant="ghost"
				className={style.exit}
				icon={"exitFullscreen"}
				onClick={() => toggleFullscreen(rootRef)}
			/>
			<IconButton
				color="primary"
				variant="ghost"
				className={style.enter}
				icon={"fullscreen"}
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
