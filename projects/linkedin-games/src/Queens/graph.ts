import { logger } from "#utils/Logger";
import { GraphNode } from "./node";
import type { ColorInfo, IGraph, IGraphNode, INodeInfo } from "./types";

// #region types

// #endregion types

export class Graph implements IGraph {
	/** The number of rows and columns in the grid */
	private readonly _sideLength: number = -1;
	private readonly _nodes: Map<number, GraphNode> = new Map();
	private readonly _colorNodes: Map<number, Set<number>> = new Map();
	private readonly _colorInfo: Map<number, ColorInfo> = new Map();
	private _queens: number[] = [];

	public get queens(): number[] {
		return this._queens;
	}

	/**
	 * Initializes a new Graph instance with the specified number of GraphNodes.
	 * @param n The sidelength of the grid
	 */
	constructor(sideLength: number) {
		logger.debug(`Initializing graph with side length: ${sideLength}`);
		if (sideLength <= 0) {
			const errorMessage = "sideLength must be greater than 0";
			logger.error(errorMessage);
			throw new Error(errorMessage);
		}
		this._sideLength = sideLength;
	}

	// #region Getters and Setters

	public get colors(): Map<number, Set<IGraphNode>> {
		const returnMap = new Map<number, Set<IGraphNode>>();
		for (const [color, nodes] of this._colorNodes) {
			const nodeList = returnMap.get(color) || new Set<IGraphNode>();
			for (const nodeId of nodes) {
				const node = this._nodes.get(nodeId);
				if (node) {
					nodeList.add(node);
				}
			}
			returnMap.set(color, nodeList);
		}
		return returnMap;
	}

	public get colorInfo(): ColorInfo[] {
		const colorInfoArray: ColorInfo[] = [];
		for (const [colorId, colorInfo] of this._colorInfo.entries()) {
			colorInfoArray[colorId] = colorInfo;
		}
		return colorInfoArray;
	}

	public set colorInfo(color: ColorInfo) {
		const colorNodes = this._colorNodes.get(color.id);
		if (!colorNodes) {
			this._colorNodes.set(color.id, new Set());
		}

		const colorInfo = this._colorInfo.get(color.id);
		if (!colorInfo) {
			this._colorInfo.set(color.id, color);
		}
	}

	// #endregion Getters and Setters

	public async filter(
		nodes: Set<IGraphNode>,
		filterFunction: (node: IGraphNode) => boolean,
	): Promise<void> {
		logger.debug(`Filtering ${nodes.size} GraphNodes in graph`);
		for (const node of nodes) {
			if (filterFunction(node)) {
				logger.debug(
					`Removing GraphNode ${node.id} with color ${node.color} at row ${node.row}, column ${node.column}`,
				);
				await this.removeGraphNode(node);
			}
		}
	}

	// public get colors(): Map<number, Set<GraphNode>> {
	// 	const returnMap = new Map<number, Set<GraphNode>>();
	// 	for (const [color, GraphNodes] of this._colors) {
	// 		const GraphNodeList = returnMap.get(color) || new Set<GraphNode>();
	// 		for (const GraphNodeId of GraphNodes) {
	// 			const GraphNode = this._nodes.get(GraphNodeId);
	// 			if (GraphNode) {
	// 				GraphNodeList.add(GraphNode);
	// 			}
	// 		}
	// 		returnMap.set(color, GraphNodeList);
	// 	}
	// 	return returnMap;
	// }

	public get nodes(): Map<number, GraphNode> {
		return this._nodes;
	}

	public get rows(): Map<number, Set<GraphNode>> {
		const rowMap: Map<number, Set<GraphNode>> = new Map();
		for (let i = 0; i < this._sideLength; i++) {
			const rowSet = rowMap.get(i) || new Set<GraphNode>();
			for (let j = 0; j < this._sideLength; j++) {
				const idx = i * this._sideLength + j;
				const GraphNode = this._nodes.get(idx);
				if (GraphNode) {
					rowSet.add(GraphNode);
				}
			}
			rowMap.set(i, rowSet);
		}
		return rowMap;
	}

	public get columns(): Map<number, GraphNode[]> {
		const columnMap: Map<number, GraphNode[]> = new Map();
		for (let i = 0; i < this._sideLength; i++) {
			for (let j = 0; j < this._sideLength; j++) {
				const idx = i * this._sideLength + j;
				const GraphNode = this._nodes.get(idx);
				if (GraphNode) {
					columnMap.set(j, [...(columnMap.get(j) || []), GraphNode]);
				}
			}
		}
		return columnMap;
	}

	// public get colorNames(): Map<number, string> {
	// 	return this._colorNames;
	// }

	public get n(): number {
		return this._sideLength;
	}

	// public get colorInfo(colorId: number): ColorInfoTuple | undefined {
	// 	return this._colorInfo.get(colorId);
	// }

	private connectGraphNodes(GraphNode1: GraphNode, GraphNode2: GraphNode) {
		GraphNode1.addEdge(GraphNode2);
		GraphNode2.addEdge(GraphNode1);
	}

	private connectGraphNodesById(id1: number, id2: number) {
		const GraphNode1 = this._nodes.get(id1);
		const GraphNode2 = this._nodes.get(id2);
		if (!GraphNode1 || !GraphNode2) {
			throw new Error(
				`One or both GraphNodes with IDs ${id1} and ${id2} do not exist in the graph.`,
			);
		}
		this.connectGraphNodes(GraphNode1, GraphNode2);
	}

	public addNode(nodeId: number, nodeColor: number) {
		const colorSet = this._colorNodes.get(nodeColor);
		if (!colorSet) {
			throw new Error(`Color ${nodeColor} does not exist in the graph.`);
		}
		const row = Math.floor(nodeId / this.n);
		const column = nodeId % this.n;
		this._nodes.set(nodeId, new GraphNode(nodeId, nodeColor, row, column));
		colorSet.add(nodeId);
	}

	public createEdges() {
		for (let column = 0; column < this.n; column++) {
			for (let row = 0; row < this.n; row++) {
				const idx = row * this.n + column;
				const currentNode = this._nodes.get(idx);
				if (!currentNode) {
					throw new Error(`Node ${idx} does not exist in the graph.`);
				}

				// Add GraphNode to the color set
				const colorSet = this._colorNodes.get(currentNode.color);
				if (!colorSet) {
					throw new Error(
						`Color ${currentNode.color} does not exist in the graph.`,
					);
				}
				colorSet.add(idx);

				// Add edges to the right
				if (column < this.n - 1) {
					for (let i = 1; i < this.n - column; i++) {
						this.connectGraphNodesById(idx, idx + i);
					}
				}

				// Add edges downwards
				if (row < this.n - 1) {
					for (let i = 1; i < this.n - row; i++) {
						this.connectGraphNodesById(idx, idx + i * this.n);
					}
				}

				// Add diagonal edges
				if (row < this.n - 1 && column < this.n - 1) {
					this.connectGraphNodesById(idx, idx + this.n + 1); // Down-right diagonal
				}
				if (row < this.n - 1 && column > 0) {
					this.connectGraphNodesById(idx, idx + this.n - 1); // Down-left diagonal
				}
			}
		}

		// Connect GraphNodes of the same color
		for (const node of this._nodes.values()) {
			const color = node.color;
			const colorSet = this._colorNodes.get(color);
			if (!colorSet) {
				throw new Error(`Color ${color} does not exist in the graph.`);
			}
			for (const colorGraphNode of colorSet) {
				if (colorGraphNode !== node.id) {
					const edgeGraphNode = this._nodes.get(colorGraphNode);
					if (edgeGraphNode) {
						node.addEdge(edgeGraphNode);
					}
				}
			}
		}
	}

	public print(): void {
		let returnString = "";
		for (const GraphNode of this._nodes.values()) {
			let edgeString = "[";
			const edges = GraphNode.edges;
			for (const edge of edges) {
				edgeString += `${edge},`;
			}
			edgeString += "]";
			returnString += `${GraphNode.id} -> ${edgeString}\n`;
		}
		console.log(returnString);
	}

	private async removeGraphNode(node: IGraphNode) {
		for await (const edgeId of node.edges) {
			const edgeNode = this._nodes.get(edgeId);
			if (edgeNode) {
				edgeNode.edges.delete(node.id);
			}
		}
		node.edges.clear();
		this._nodes.delete(node.id);
		this._colorNodes.get(node.color)?.delete(node.id);
		if (!node.removed) {
			node.removed = true;
		}
	}

	private async removeGraphNodeAndNeighbors(node: IGraphNode) {
		for await (const edgeId of node.edges) {
			const edgeNode = this._nodes.get(edgeId);
			if (edgeNode) {
				await this.removeGraphNode(edgeNode);
			}
		}
		this._colorNodes.delete(node.color);
		this._nodes.delete(node.id);
	}

	public async placeQueen(node: IGraphNode) {
		this._queens.push(node.id);
		// const nodeEdges = Array.from(graphNode.edges.values());
		await this.removeGraphNodeAndNeighbors(node);
		// return {
		// 	id: graphNode.id,
		// 	edges: nodeEdges,
		// };
	}

	public async excludeCell(node: IGraphNode) {
		await this.removeGraphNode(node);
	}

	public getColorSet(color: number): Set<number> {
		const colorSet = this._colorNodes.get(color);
		if (!colorSet) {
			throw new Error(`Color ${color} does not exist in the graph.`);
		}
		return colorSet;
	}
}
