import style from "./sidebar.module.scss";

interface Props {
	fullscreen?: boolean;
}

export default function Sidebar(props: Props) {
	return (
		<div className={style.sidebar} data-fullscreen={props.fullscreen}>
			<div className={style.sidebar__content} />
		</div>
	);
}
