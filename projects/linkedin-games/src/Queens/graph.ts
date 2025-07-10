import { logger } from "#utils/Logger";
import { GraphNode } from "./node";
import type { ColorInfo, IGraph, INode } from "./types";

export class Graph implements IGraph {
	/** The number of rows and columns in the grid */
	private readonly _nodes: Map<number, INode> = new Map();
	private readonly _colorNodes: Map<number, Set<number>> = new Map();
	private readonly _colorInfo: Map<number, ColorInfo> = new Map();
	private readonly _queens: number[] = [];
	private _sideLength = -1;

	// #region Getters and Setters

	public get queens(): number[] {
		return this._queens;
	}

	public set sideLength(length: number) {
		this._sideLength = length;
	}

	public get colors(): Map<number, Set<INode>> {
		const returnMap = new Map<number, Set<INode>>();
		for (const [color, nodes] of this._colorNodes) {
			const nodeList = returnMap.get(color) || new Set<INode>();
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
		nodes: Set<INode>,
		filterFunction: (node: INode) => boolean,
	): Promise<void> {
		logger.debug(`Filtering ${nodes.size} GraphNodes in graph`);
		for (const node of nodes) {
			if (filterFunction(node)) {
				logger.debug(
					`Removing GraphNode ${node.id} with color ${node.color} at row ${node.row}, column ${node.column}`,
				);
				await this.removeNode(node);
			}
		}
	}

	public get nodes(): Map<number, INode> {
		return this._nodes;
	}

	public get rows(): Map<number, Set<INode>> {
		const rowMap: Map<number, Set<INode>> = new Map();
		for (let i = 0; i < this._sideLength; i++) {
			const rowSet = rowMap.get(i) || new Set<INode>();
			for (let j = 0; j < this._sideLength; j++) {
				const idx = i * this._sideLength + j;
				const node = this._nodes.get(idx);
				if (node) {
					rowSet.add(node);
				}
			}
			rowMap.set(i, rowSet);
		}
		return rowMap;
	}

	public get columns(): Map<number, Set<INode>> {
		const columnMap: Map<number, Set<INode>> = new Map();
		for (let i = 0; i < this._sideLength; i++) {
			const columnSet = columnMap.get(i) || new Set<INode>();
			for (let j = 0; j < this._sideLength; j++) {
				const idx = i * this._sideLength + j;
				const node = this._nodes.get(idx);
				if (node) {
					columnSet.add(node);
				}
			}
		}
		return columnMap;
	}

	private connectNodes(node1: INode, node2: INode) {
		node1.addEdge(node2);
		node2.addEdge(node1);
	}

	private connectGraphNodesById(id1: number, id2: number) {
		const node1 = this._nodes.get(id1);
		const node2 = this._nodes.get(id2);
		if (!node1 || !node2) {
			throw new Error(
				`One or both GraphNodes with IDs ${id1} and ${id2} do not exist in the graph.`,
			);
		}
		this.connectNodes(node1, node2);
	}

	public addNode(nodeId: number, nodeColor: number) {
		const colorSet = this._colorNodes.get(nodeColor);
		if (!colorSet) {
			throw new Error(`Color ${nodeColor} does not exist in the graph.`);
		}
		const row = Math.floor(nodeId / this._sideLength);
		const column = nodeId % this._sideLength;
		this._nodes.set(nodeId, new GraphNode(nodeId, nodeColor, row, column));
		colorSet.add(nodeId);
	}

	public createEdges() {
		for (let column = 0; column < this._sideLength; column++) {
			for (let row = 0; row < this._sideLength; row++) {
				const idx = row * this._sideLength + column;
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
				if (column < this._sideLength - 1) {
					for (let i = 1; i < this._sideLength - column; i++) {
						this.connectGraphNodesById(idx, idx + i);
					}
				}

				// Add edges downwards
				if (row < this._sideLength - 1) {
					for (let i = 1; i < this._sideLength - row; i++) {
						this.connectGraphNodesById(idx, idx + i * this._sideLength);
					}
				}

				// Add diagonal edges
				if (row < this._sideLength - 1 && column < this._sideLength - 1) {
					this.connectGraphNodesById(idx, idx + this._sideLength + 1); // Down-right diagonal
				}
				if (row < this._sideLength - 1 && column > 0) {
					this.connectGraphNodesById(idx, idx + this._sideLength - 1); // Down-left diagonal
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

	private async removeNode(
		node: INode
	) {
		for await (const edgeNode of node.edges.values()) {
			edgeNode.edges.delete(node.id);
		}
		node.edges.clear();
		this._nodes.delete(node.id);
		this._colorNodes.get(node.color)?.delete(node.id);
		if (!node.removed) {
			node.removed = true;
		}
	}

	private async removeNodeAndNeighbors(
		node: INode
	) {
		for await (const edgeNode of node.edges.values()) {
			await this.removeNode(edgeNode);
		}
		this._colorNodes.delete(node.color);
		this._nodes.delete(node.id);
	}

	public async placeQueen(node: INode) {
		this._queens.push(node.id);
		await this.removeNodeAndNeighbors(node);
	}

	public async excludeCell(
		node: INode,
	) {
		await this.removeNode(node);
	}
}
