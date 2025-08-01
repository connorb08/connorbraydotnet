import { useContext } from "react";
import { IconButton } from "#components/ui/buttons";
import { GlobalContext } from "#utils/context";
import style from "./style.module.scss";

export function FullscreenToggle() {
	const { rootRef, toggleFullscreen } = useContext(GlobalContext);

	return (
		<>
			<IconButton
				className={style.enter}
				icon={"fullscreen"}
				onClick={() => toggleFullscreen(rootRef)}
			/>
			<IconButton
				className={style.exit}
				icon={"exitFullscreen"}
				onClick={() => toggleFullscreen(rootRef)}
			/>
		</>
	);
}
