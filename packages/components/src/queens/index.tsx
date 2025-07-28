import type { GameData } from "shared";
import style from "./style.module.css";

const _gameData: GameData = {
	sideLength: 9,
	colors: [
		"rgb(187, 163, 226)",
		"rgb(255, 201, 146)",
		"rgb(150, 190, 255)",
		"rgb(179, 223, 160)",
		"rgb(223, 223, 223)",
		"rgb(255, 123, 96)",
		"rgb(230, 243, 136)",
		"rgb(185, 178, 158)",
		"rgb(223, 160, 191)",
	],
	cellColors: [
		5, 5, 5, 5, 1, 2, 2, 2, 2, 5, 5, 5, 5, 1, 3, 3, 2, 2, 5, 5, 4, 5, 1, 3, 3,
		3, 2, 5, 0, 4, 4, 1, 3, 6, 3, 2, 5, 0, 0, 4, 1, 6, 6, 6, 2, 5, 7, 0, 4, 1,
		8, 2, 2, 2, 5, 7, 7, 7, 1, 8, 8, 2, 2, 5, 5, 5, 5, 1, 8, 8, 8, 2, 5, 5, 5,
		5, 1, 8, 8, 8, 8,
	],
	cellsRemoved: [
		1, 2, 3, 10, 11, 12, 19, 21, 64, 65, 66, 73, 74, 75, 38, 29, 46, 55, 47, 36,
		27, 51, 48, 54, 58, 59, 60, 61, 62, 30, 31, 32, 34, 35, 39, 40, 44, 56, 49,
		67, 18, 22, 23, 24, 25, 26, 28, 41, 42, 43, 45, 6, 15, 69, 78, 9, 13, 16,
		17, 5, 50, 68, 77, 4, 71, 7, 8, 72, 79, 80, 52, 63,
	],
	queenPositions: [57, 20, 37, 33, 14, 76, 53, 70, 0],
};

const QueenSvg = () => (
	<svg
		style={{
			height: "50%",
			width: "50%",
			maxHeight: "100%",
			maxWidth: "100%",
			padding: "10%",
		}}
		width="24"
		height="24"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		role="img"
		aria-label="Queen"
	>
		<title>Queen</title>
		<g clipPath="url(#clip0_3812_70403)">
			<path d="M23.25 7C23.25 7.69 22.69 8.25 22 8.25C21.89 8.25 21.78 8.21 21.68 8.18L19 17.99H5L2.32 8.18C2.21 8.21 2.11 8.25 2 8.25C1.31 8.25 0.75 7.69 0.75 7C0.75 6.31 1.31 5.75 2 5.75C2.69 5.75 3.25 6.31 3.25 7C3.25 7.31 3.13 7.59 2.94 7.8L9 13L11.65 4.18C11.14 4.03 10.75 3.57 10.75 3C10.75 2.31 11.31 1.75 12 1.75C12.69 1.75 13.25 2.31 13.25 3C13.25 3.56 12.87 4.02 12.35 4.18L15 13L21.06 7.8C20.87 7.58 20.75 7.31 20.75 7C20.75 6.31 21.31 5.75 22 5.75C22.69 5.75 23.25 6.31 23.25 7ZM19 19H5C4.45 19 4 19.45 4 20C4 20.55 4.45 21 5 21H19C19.55 21 20 20.55 20 20C20 19.45 19.55 19 19 19Z" />
		</g>
		<defs>
			<clipPath id="clip0_3812_70403">
				<rect width="24" height="24" fill="white" />
			</clipPath>
		</defs>
	</svg>
);

const CrossSvg = () => (
	<svg
		style={{
			height: "40%",
			width: "40%",
			maxHeight: "100%",
			maxWidth: "100%",
			padding: "10%",
		}}
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<title>Cross</title>
		<path
			d="M10.875 4.25L8 7.125L5.125 4.25L4.25 5.125L7.125 8L4.25 10.875L5.125 11.75L8 8.875L10.875 11.75L11.75 10.875L8.875 8L11.75 5.125L10.875 4.25Z"
			fill="black"
			fillOpacity="0.75"
		/>
	</svg>
);

export function QueensResult(props: GameData) {
	const gameData: GameData = props || _gameData;
	return (
		<div
			className={style.container}
			style={{
				gridTemplateColumns: `repeat(${gameData.sideLength}, 1fr)`,
			}}
		>
			{gameData.cellColors.map((color, index) => (
				<div
					key={index}
					className={style.node}
					style={{
						backgroundColor: gameData.colors[color],
					}}
					data-queen={gameData.queenPositions.includes(index)}
				>
					{gameData.queenPositions.includes(index) ? (
						<QueenSvg />
					) : (
						<CrossSvg />
					)}
				</div>
			))}
		</div>
	);
}
