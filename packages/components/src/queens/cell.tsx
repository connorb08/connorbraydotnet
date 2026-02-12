import { CrossSvg, QueenSvg } from "./icons";
import style from "./style.module.css";

export interface QueensCellProps {
	color: string;
	isQueen: boolean;
}

export default function QueensCell(props: QueensCellProps) {
	return (
		<div
			className={style.cell}
			style={{
				backgroundColor: props.color,
			}}
			data-queen={props.isQueen}
		>
			{props.isQueen ? <QueenSvg /> : <CrossSvg />}
		</div>
	);
}
