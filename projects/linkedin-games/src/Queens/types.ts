interface IGraph {
	readonly queens: number[];
	readonly colors: Map<number, Set<INode>>;

	// get colors(): Map<number, Set<number>>;

	// Getters and Setters
	set colorInfo(color: ColorInfo);
	get colorInfo(): ColorInfo[];

	// Methods
	addNode(nodeId: number, colorId: number): void;
	createEdges(): void;

	placeQueen(node: INode): Promise<void>;
}

interface INodeInfo {
	id: number;
	edges: number[];
}

interface INode {
	removed: boolean;
	readonly id: number;
	readonly row: number;
	readonly column: number;
	readonly color: number;
	readonly edges: Map<number, INode>;

	addEdge(node: INode | number): Promise<void>;
}

interface IPageController {
	startGame(): Promise<void>;
	getSideLength(): Promise<number>;
	populateGraph(graph: IGraph): Promise<void>;
	placeQueen(node: INode): Promise<void>;
	placeCross(node: INode): Promise<void>;
	clickSquare(node: INode): Promise<void>;
	clickSquareById(nodeId: number): Promise<void>;
	placeQueenById(nodeId: number): Promise<void>;
	pause(): Promise<void>;
	[Symbol.asyncDispose](): Promise<void>;
}

interface IGameController {
	readonly pageController: IPageController;
}

interface ColorInfo {
	id: number;
	name: string;
	hex: string;
}

export type {
	IGraph,
	INode,
	IPageController,
	IGameController,
	ColorInfo,
	INodeInfo,
};
