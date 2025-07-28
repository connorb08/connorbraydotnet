import style from "./sidebar.module.scss";

export default function Sidebar() {
	return (
		<div className={style.sidebar}>
			<div className={style.sidebar__content} />
		</div>
	);
}
