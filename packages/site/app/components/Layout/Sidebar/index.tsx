import { GoGear } from "react-icons/go";
import { toggleTheme } from "#app/utils";
import IconButton from "../../IconButton";
import style from "./sidebar.module.scss";

export default function Sidebar() {
	return (
		<div className={style.sidebar}>
			<div className={style.sidebar__content} />
			{/* <IconButton className={style.sidebar__button} onClick={toggleTheme}>
				<GoGear />
			</IconButton> */}
		</div>
	);
}
