import config from "#config";
import BaseGame from "#root/Game/index.ts";
import { exit } from "node:process";

class Graph {
	/** The number of rows and columns in the grid */
	private readonly _sideLength: number;
	private readonly _nodes: Map<number, Node> = new Map();
	private readonly _colors: Map<number, Set<number>> = new Map();
	private readonly _colorNames: Map<number, string> = new Map();

	/**
	 * Initializes a new Graph instance with the specified number of nodes.
	 * @param n The sidelength of the grid
	 */
	constructor(sideLength: number) {
		if (sideLength <= 0) {
			throw new Error("sideLength must be greater than 0");
		}
		this._sideLength = sideLength;
		for (let i = 0; i < sideLength; i++) {
			this._colors.set(i, new Set());
			this._colorNames.set(i, "");
		}
	}

	public filterRow(row: number, filter: (node: Node) => boolean): void {
		const rowSet = this.rows.get(row);
		if (rowSet) {
			for (const node of rowSet) {
				if (filter(node)) {
					this.removeNode(node);
				}
			}
		} else {
			throw new Error(`Row ${row} does not exist in the graph.`);
		}
	}

	public filterColumn(column: number, filter: (node: Node) => boolean): void {
		const columnSet = this.columns.get(column);
		if (columnSet) {
			for (const node of columnSet) {
				if (filter(node)) {
					this.removeNode(node);
				}
			}
		} else {
			throw new Error(`Column ${column} does not exist in the graph.`);
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

	// public getNodesInRow(row: number): Node[] {}

	// public rows(): Node[][] {
	// 	return this.nodes.values().reduce((rows, node) => {
	// 		const rowIndex = Math.floor(node.idx / this.n);
	// 		if (!rows[rowIndex]) {
	// 			rows[rowIndex] = [];
	// 		}
	// 		rows[rowIndex].push(node);
	// 		return rows;
	// 	}, [] as Node[][]);
	// }

	// public cols(): Node[][] {
	// 	return this.nodes.values().reduce((cols, node) => {
	// 		const colIndex = node.idx % this.n;
	// 		if (!cols[colIndex]) {
	// 			cols[colIndex] = [];
	// 		}
	// 		cols[colIndex].push(node);
	// 		return cols;
	// 	}, [] as Node[][]);
	// }

	public setColorName(color: number, name: string) {
		if (!this.colors.has(color)) {
			throw new Error(`Color ${color} does not exist in the graph.`);
		}
		this.colorNames.set(color, name);
	}

	public addEdge(node1: number, node2: number) {
		if (!this.nodes.has(node1) || !this.nodes.has(node2)) {
			throw new Error(
				`One or both nodes (${node1}, ${node2}) do not exist in the graph.`,
			);
		}
		this.nodes.get(node1)?.addEdge(node2);
		this.nodes.get(node2)?.addEdge(node1);
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
						this.addEdge(idx, idx + i);
					}
				}

				// Add edges downwards
				if (row < this.n - 1) {
					for (let i = 1; i < this.n - row; i++) {
						this.addEdge(idx, idx + i * this.n);
					}
				}

				// Add diagonal edges
				if (row < this.n - 1 && column < this.n - 1) {
					this.addEdge(idx, idx + this.n + 1); // Down-right diagonal
				}
				if (row < this.n - 1 && column > 0) {
					this.addEdge(idx, idx + this.n - 1); // Down-left diagonal
				}
			}
		}
	}

	private toString(): string {
		const nodes = this.nodes.keys();
		let returnString = "";
		for (const node of nodes) {
			let edgeString = "[";
			const edges = this.nodes.get(node)?.edges || [];
			for (const edge of edges) {
				edgeString += `${edge},`;
			}
			edgeString += "]";
			returnString += `${node} -> ${edgeString}\n`;
		}
		return returnString;
	}

	public print(): void {
		console.log(this.toString());
	}

	public printColors(): void {
		const colors = this.colors.entries();
		for (const [color, colorList] of colors) {
			console.log(
				`${color} (${this.colorNames.get(color)}) ->`,
				Array.from(colorList),
			);
		}
	}

	public removeNode(node: Node) {
		this._nodes.delete(node.id);
		this._colors.get(node.color)?.delete(node.id);
	}

	public removeNodeById(nodeId: number) {
		this._nodes.delete(nodeId);
		this._colors.get(this._nodes.get(nodeId)?.color || -1)?.delete(nodeId);
	}

	private removeNodeAndNeighbors(node: Node) {
		this.removeNode(node);
		this._colors.delete(node.color);
		for (const edge of node.edges) {
			const edgeNode = this._nodes.get(edge);
			if (edgeNode) {
				this.removeNode(edgeNode);
			}
		}
	}

	public placeQueen(nodeNumber: number) {
		const node = this._nodes.get(nodeNumber);
		if (!node) {
			throw new Error(`Node ${nodeNumber} does not exist in the graph.`);
		}
		this.removeNodeAndNeighbors(node);
	}

	public getColorSet(color: number): Set<number> {
		const colorSet = this._colors.get(color);
		if (!colorSet) {
			throw new Error(`Color ${color} does not exist in the graph.`);
		}
		return colorSet;
	}
}

class Node {
	private readonly _id: number;
	public readonly _row: number;
	private readonly _column: number;
	private readonly _color: number;
	private readonly _edges: Set<number> = new Set<number>();

	public constructor(id: number, color: number, row: number, column: number) {
		this._id = id;
		this._color = color;
		this._row = row;
		this._column = column;
	}

	public get id(): number {
		return this._id;
	}

	public get row(): number {
		return this._row;
	}

	public get column(): number {
		return this._column;
	}

	public get color(): number {
		return this._color;
	}

	public get edges(): Set<number> {
		return this._edges;
	}

	public addEdge(nodeNumber: number): void {
		this._edges.add(nodeNumber);
	}
}

/**
 * Queens Game
 *
 * This module handles the Queens game on LinkedIn.
 * It initializes the game, starts it, and provides a method to play the game.
 */
export const PlayQueens = async () => {
	const queens = await BaseGame({ url: config.Urls.Queens });
	await queens.start();

	await queens.playGame(async (page) => {
		/* Close the popup windows */
		await page.locator("button#launch-footer-start-button").click();
		await page.locator('button[aria-label="Dismiss"]').click();

		/* Get the number of rows */
		const rows = await page.locator("div#queens-grid").evaluate((el) => {
			return window.getComputedStyle(el).getPropertyValue("--rows");
		});

		const graph = new Graph(+rows);

		const nodes = await page.locator("div.queens-cell-with-border").all();
		await Promise.all(
			nodes.map(async (cell) => {
				const [cellIdx, cellColor, ariaLabel] = await Promise.all([
					cell.getAttribute("data-cell-idx"),
					cell.getAttribute("class"),
					cell.getAttribute("aria-label"),
				]);

				const idx = +(cellIdx ?? -1);
				const color = +(cellColor?.split("-").slice(-1)[0]?.trim() ?? -1);

				const [, colorName = ""] =
					ariaLabel?.match(/of color\s*([^,]+)/i) ?? [];

				if (idx === -1) {
					console.error("Invalid cell index found:", cellIdx);
					exit(1);
				}

				if (color === -1) {
					console.error("No color found for cell", cellIdx);
					exit(1);
				}
				// await page.pause();
				graph.addNode(idx, color);
				graph.setColorName(color, colorName.trim());
			}),
		);

		graph.createEdges();
		// graph.placeQueen(41);

		const startingNode = graph.nodes.values().next().value;

		if (!startingNode) {
			throw new Error("No starting node found in the graph.");
		}

		await SearchGraph({ graph });
		graph.print();
		console.log(graph.nodes.size);
		await page.pause();
	});
};

async function SearchGraph({ graph }: { graph: Graph }) {
	let continueSearch = true;

	if (!continueSearch) {
		console.error("No edges found for the starting node.");
		throw new Error("No edges found for the starting node.");
	}

	search: while (continueSearch) {
		console.log("looping...");
		for (const [rowNumber, row] of graph.rows.entries()) {
			if (row.size === 0) {
				continue;
			}

			if (row.size === 1) {
				const nodeId = row.values().next().value?.id;
				if (nodeId === undefined) {
					throw new Error(`No node found for row ${rowNumber}`);
				}
				graph.placeQueen(nodeId);
				continue search;
			}

			const rowColor = Array.from(row).reduce((acc, node) => {
				if (acc === -99) {
					throw new Error(`No color found for row ${node.row}`);
				}
				return acc === node.color ? acc : -1;
			}, row.values().next().value?.color ?? -99);

			if (rowColor !== -1) {
				let updatedGraph = false;
				const colorNodes = graph.colors.get(rowColor);

				if (!colorNodes) {
					throw new Error(`No nodes found for color ${rowColor}`);
				}

				if (colorNodes.size === 1) {
					const node = colorNodes.values().next().value;
					if (node === undefined) {
						throw new Error(`No node found for color ${rowColor}`);
					}
					graph.placeQueen(node.id);
					continue search;
				}

				for (const node of colorNodes) {
					if (node.row !== rowNumber) {
						graph.removeNode(node);
						updatedGraph = true;
					}
				}

				if (updatedGraph) {
					continue search;
				}
			}
		}

		for (const [columnNumber, column] of graph.columns.entries()) {
			if (column.length === 0) {
				continue;
			}

			if (column.length === 1) {
				const nodeId = column[0]?.id;
				if (nodeId === undefined) {
					throw new Error(`No node found for column ${column[0]?.column}`);
				}
				graph.placeQueen(nodeId);
				continue search;
			}

			const columnColor = column.reduce((acc, node) => {
				if (acc === -99) {
					throw new Error(`No color found for column ${node.column}`);
				}
				return acc === node.color ? acc : -1;
			}, column[0]?.color ?? -99);

			if (columnColor !== -1) {
				let updatedGraph = false;
				const colorNodes = graph.colors.get(columnColor);

				if (!colorNodes) {
					throw new Error(`No nodes found for color ${columnColor}`);
				}

				if (colorNodes.size === 1) {
					const node = colorNodes.values().next().value;
					if (node === undefined) {
						throw new Error(`No node found for color ${columnColor}`);
					}
					graph.placeQueen(node.id);
					continue search;
				}

				for (const node of colorNodes) {
					if (node.column !== columnNumber) {
						graph.removeNode(node);
						updatedGraph = true;
					}
				}

				if (updatedGraph) {
					continue search;
				}
			}
		}

		for (const [colorNumber, colors] of graph.colors.entries()) {
			if (colors.size === 0) {
				continue;
			}

			if (colors.size === 1) {
				const nodeId = colors.values().next().value?.id;
				if (nodeId === undefined) {
					throw new Error(`No node found for color ${colorNumber}`);
				}
				graph.placeQueen(nodeId);
				continue search;
			}

			const rowNumbers: Set<number> = new Set();
			const columnNumbers: Set<number> = new Set();
			for (const node of colors) {
				rowNumbers.add(node.row);
				columnNumbers.add(node.column);
			}

			if (rowNumbers.size === 1) {
				const row = rowNumbers.values().next().value;
				if (row === undefined) {
					throw new Error(`No row found for color ${colorNumber}`);
				}
				graph.filterRow(row, (node) => node.color !== colorNumber);
				continue search;
			}

			if (columnNumbers.size === 1) {
				const column = columnNumbers.values().next().value;
				if (column === undefined) {
					throw new Error(`No column found for color ${colorNumber}`);
				}
				graph.filterColumn(column, (node) => node.color !== colorNumber);
				continue search;
			}
		}

		continueSearch = false;
	}
}

export default PlayQueens;
