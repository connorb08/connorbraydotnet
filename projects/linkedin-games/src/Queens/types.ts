interface IGraph {
	readonly queens: number[];

	readonly colors: Map<number, Set<IGraphNode>>;

	// get colors(): Map<number, Set<number>>;

	// Getters and Setters
	set colorInfo(color: ColorInfo);
	get colorInfo(): ColorInfo[];

	// Methods
	addNode(nodeId: number, colorId: number): void;
	createEdges(): void;

	placeQueen(node: IGraphNode): Promise<void>;
}

interface INodeInfo {
	id: number;
	edges: number[];
}

interface IGraphNode {
	removed: boolean;
	readonly id: number;
	readonly row: number;
	readonly column: number;
	readonly color: number;
	readonly edges: Set<number>;

	addEdge(node: IGraphNode | number): Promise<void>;
}

interface IPageController {
	startGame(): Promise<void>;
	getSideLength(): Promise<number>;
	populateGraph(graph: IGraph): Promise<void>;
	placeQueen(node: IGraphNode): Promise<void>;
	placeCross(node: IGraphNode): Promise<void>;
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
	IGraphNode,
	IPageController,
	IGameController,
	ColorInfo,
	INodeInfo,
};
