import type { GameData } from "shared";
import style from "./style.module.css";

interface Props {
	gameData: GameData;
}

const gameData: GameData = {
	sideLength: 9,
	queens: [21, 14, 54, 67, 8, 33, 38, 52],
	removed: [],
	colors: [
		"#c1a324",
		"#83ce1b",
		"#810d8b",
		"#aa1910",
		"#a3e229",
		"#769ad7",
		"#ca9ee5",
		"#5ec1c9",
		"#8870ac",
	],
	nodesColors: [
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 8, 0, 0, 0, 0, 0, 8, 2, 2, 8, 8,
		8, 0, 0, 3, 3, 3, 2, 4, 4, 8, 0, 0, 3, 3, 3, 2, 4, 4, 5, 0, 0, 3, 3, 3, 2,
		2, 4, 5, 0, 6, 3, 3, 3, 7, 4, 4, 5, 0, 6, 1, 1, 1, 7, 4, 5, 5, 5, 1, 1, 4,
		4, 4, 4, 4, 4, 4,
	],
};

export function QueensResult(_: Props) {
	return (
		<div
			className={style.container}
			style={{
				gridTemplateColumns: `repeat(${gameData.sideLength}, 1fr)`,
			}}
		>
			{gameData.nodesColors.map((color, index) => (
				<div
					key={index}
					className={style.node}
					style={{
						backgroundColor: gameData.colors[color],
					}}
					data-queen={gameData.queens.includes(index)}
				>
					{gameData.queens.includes(index) ? "♛" : index}
				</div>
			))}
		</div>
	);
}
