import type { QueensSolution } from "types";
import QueensCell from "./cell";
import style from "./style.module.css";

export function QueensGrid(props: QueensSolution) {
	return (
		<div
			className={style.container}
			style={{
				gridTemplateColumns: `repeat(${props.sideLength}, 1fr)`,
			}}
		>
			{props.cellColors.map((colorId, index) => (
				<QueensCell
					key={index}
					color={props.colors[colorId]?.rgb || "rgb(0,0,0)"}
					isQueen={props.queenPositions.includes(index)}
				/>
			))}
		</div>
	);
}
