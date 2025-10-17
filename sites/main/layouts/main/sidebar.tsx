// import { useContext } from "react";
// import { GlobalContext } from "#utils/state/index";
import style from "./sidebar.module.scss";

export default function Sidebar() {
	// const { fullscreen } = useContext(GlobalContext);
	return (
		<div className={style.sidebar}>
			<div className={style.sidebar__content} />
		</div>
	);
}
