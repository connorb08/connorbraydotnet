import { Logger } from "#root/utils/Logger.ts";
import type { Page } from "playwright";
import { Node } from "./node.ts";

const logger = Logger({
	logLevel: "debug",
});

export class Graph {
	/** The number of rows and columns in the grid */
	private readonly _sideLength: number;
	private readonly _nodes: Map<number, Node> = new Map();
	private readonly _colors: Map<number, Set<number>> = new Map();
	private readonly _colorNames: Map<number, string> = new Map();
	private readonly _page: Page;
	private readonly _modifyPage: boolean = false;
	private _queens: number[] = [];

	public get queens(): number[] {
		return this._queens;
	}

	/**
	 * Initializes a new Graph instance with the specified number of nodes.
	 * @param n The sidelength of the grid
	 */
	constructor(sideLength: number, page: Page) {
		logger.debug(`Initializing graph with side length: ${sideLength}`);
		if (sideLength <= 0) {
			throw new Error("sideLength must be greater than 0");
		}
		this._sideLength = sideLength;
		this._page = page;
		for (let i = 0; i < sideLength; i++) {
			this._colors.set(i, new Set());
			this._colorNames.set(i, "");
		}
	}

	public async filter(
		nodes: Set<Node>,
		filter: (node: Node) => boolean,
	): Promise<void> {
		logger.debug(`Filtering ${nodes.size} nodes in graph`);
		for (const node of nodes) {
			if (filter(node)) {
				logger.debug(
					`Removing node ${node.id} with color ${node.color} at row ${node.row}, column ${node.column}`,
				);
				await this.removeNode(node);
			}
		}
	}

	public get colors(): Map<number, Set<Node>> {
		const returnMap = new Map<number, Set<Node>>();
		for (const [color, nodes] of this._colors) {
			const nodeList = returnMap.get(color) || new Set<Node>();
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

	public get nodes(): Map<number, Node> {
		return this._nodes;
	}

	public get rows(): Map<number, Set<Node>> {
		const rowMap: Map<number, Set<Node>> = new Map();
		for (let i = 0; i < this._sideLength; i++) {
			const rowSet = rowMap.get(i) || new Set<Node>();
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

	public get columns(): Map<number, Node[]> {
		const columnMap: Map<number, Node[]> = new Map();
		for (let i = 0; i < this._sideLength; i++) {
			for (let j = 0; j < this._sideLength; j++) {
				const idx = i * this._sideLength + j;
				const node = this._nodes.get(idx);
				if (node) {
					columnMap.set(j, [...(columnMap.get(j) || []), node]);
				}
			}
		}
		return columnMap;
	}

	public get colorNames(): Map<number, string> {
		return this._colorNames;
	}

	public get n(): number {
		return this._sideLength;
	}

	public setColorName(color: number, name: string) {
		if (!this.colors.has(color)) {
			throw new Error(`Color ${color} does not exist in the graph.`);
		}
		this.colorNames.set(color, name);
	}

	private connectNodes(node1: Node, node2: Node) {
		node1.addEdge(node2);
		node2.addEdge(node1);
	}

	private connectNodesById(id1: number, id2: number) {
		const node1 = this._nodes.get(id1);
		const node2 = this._nodes.get(id2);
		if (!node1 || !node2) {
			throw new Error(
				`One or both nodes with IDs ${id1} and ${id2} do not exist in the graph.`,
			);
		}
		this.connectNodes(node1, node2);
	}

	public addNode(idx: number, color: number) {
		const colorSet = this._colors.get(color);
		if (!colorSet) {
			throw new Error(`Color ${color} does not exist in the graph.`);
		}
		const row = Math.floor(idx / this.n);
		const column = idx % this.n;
		this.nodes.set(idx, new Node(idx, color, row, column));
		colorSet.add(idx);
	}

	public createEdges() {
		for (let column = 0; column < this.n; column++) {
			for (let row = 0; row < this.n; row++) {
				const idx = row * this.n + column;
				const currentNode = this.nodes.get(idx);
				if (!currentNode) {
					throw new Error(`Node ${idx} does not exist in the graph.`);
				}

				// Add node to the color set
				const colorSet = this._colors.get(currentNode.color);
				if (!colorSet) {
					throw new Error(
						`Color ${currentNode.color} does not exist in the graph.`,
					);
				}
				colorSet.add(idx);

				// Add edges to the right
				if (column < this.n - 1) {
					for (let i = 1; i < this.n - column; i++) {
						this.connectNodesById(idx, idx + i);
					}
				}

				// Add edges downwards
				if (row < this.n - 1) {
					for (let i = 1; i < this.n - row; i++) {
						this.connectNodesById(idx, idx + i * this.n);
					}
				}

				// Add diagonal edges
				if (row < this.n - 1 && column < this.n - 1) {
					this.connectNodesById(idx, idx + this.n + 1); // Down-right diagonal
				}
				if (row < this.n - 1 && column > 0) {
					this.connectNodesById(idx, idx + this.n - 1); // Down-left diagonal
				}
			}
		}

		// Connect nodes of the same color
		for (const node of this.nodes.values()) {
			const color = node.color;
			const colorSet = this._colors.get(color);
			if (!colorSet) {
				throw new Error(`Color ${color} does not exist in the graph.`);
			}
			for (const colorNode of colorSet) {
				if (colorNode !== node.id) {
					const edgeNode = this._nodes.get(colorNode);
					if (edgeNode) {
						node.addEdge(edgeNode);
					}
				}
			}
		}
	}

	public print(): void {
		let returnString = "";
		for (const node of this._nodes.values()) {
			let edgeString = "[";
			const edges = node.edges;
			for (const edge of edges) {
				edgeString += `${edge},`;
			}
			edgeString += "]";
			returnString += `${node.id} -> ${edgeString}\n`;
		}
		console.log(returnString);
	}

	private async removeNode(node: Node) {
		for await (const edgeId of node.edges) {
			const edgeNode = this._nodes.get(edgeId);
			if (edgeNode) {
				edgeNode.edges.delete(node.id);
			}
		}
		node.edges.clear();
		this._nodes.delete(node.id);
		this._colors.get(node.color)?.delete(node.id);
		if (!node.removed) {
			if (this._modifyPage) {
				await this._page.locator(`[data-cell-idx="${node.id}"]`).click();
			}
			node.removed = true;
		}
	}

	private async removeNodeAndNeighbors(node: Node) {
		for await (const edgeId of node.edges) {
			const edgeNode = this._nodes.get(edgeId);
			if (edgeNode) {
				await this.removeNode(edgeNode);
			}
		}
		this._colors.delete(node.color);
		this._nodes.delete(node.id);
	}

	public async placeQueen(node: Node) {
		this._queens.push(node.id);
		if (this._modifyPage) {
			await this._page.locator(`[data-cell-idx="${node.id}"]`).click();
		}
		await this.removeNodeAndNeighbors(node);
	}

	public async excludeCell(node: Node) {
		await this.removeNode(node);
	}

	public getColorSet(color: number): Set<number> {
		const colorSet = this._colors.get(color);
		if (!colorSet) {
			throw new Error(`Color ${color} does not exist in the graph.`);
		}
		return colorSet;
	}
}
