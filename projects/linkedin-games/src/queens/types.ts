interface ColorInfo {
	id: number;
	name: string;
	hex: string;
}

interface GameData {
	sideLength: number;
	queens: number[];
	colors: string[];
	nodesColors: number[];
	removed: number[];
}

export type { ColorInfo, GameData };
