interface IGraph {
	readonly queens: number[];
	readonly colors: Map<number, Set<INode>>;

	// get colors(): Map<number, Set<number>>;

	// Getters
	get colorInfo(): ColorInfo[];
	get sideLength(): number;

	// Setters
	set colorInfo(color: ColorInfo);
	set sideLength(length: number);

	// Methods
	addNode(nodeId: number, colorId: number): void;
	createEdges(): void;

	placeQueen(node: INode): Promise<void>;
}

interface INode {
	// Properties
	readonly id: number;
	readonly row: number;
	readonly column: number;
	readonly color: number;
	readonly edges: Map<number, INode>;

	// Flags
	removed: boolean;

	// Methods
	addEdge(node: INode | number): Promise<void>;
}

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
}

export type { IGraph, INode, ColorInfo, GameData };
