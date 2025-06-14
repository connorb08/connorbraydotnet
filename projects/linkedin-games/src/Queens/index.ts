import config from "#config";
import BaseGame from "#root/Game/index.ts";
import { exit } from "node:process";

class Graph {
	private n: number;
	private nodes: Map<number, Node> = new Map();
	private colors: Map<number, Set<number>> = new Map();
	private colorNames: Map<number, string> = new Map();

	/**
	 * Initializes a new Graph instance with the specified number of nodes.
	 * @param n The sidelength of the grid
	 */
	constructor(n: number) {
		if (n <= 0) {
			throw new Error("n must be greater than 0");
		}
		this.n = n;
		for (let i = 0; i < n; i++) {
			this.colors.set(i, new Set());
			this.colorNames.set(i, "");
		}
	}

	public rows(): Node[][] {
		return this.nodes.values().reduce((rows, node) => {
			const rowIndex = Math.floor(node.idx / this.n);
			if (!rows[rowIndex]) {
				rows[rowIndex] = [];
			}
			rows[rowIndex].push(node);
			return rows;
		}, [] as Node[][]);
	}

	public cols(): Node[][] {
		return this.nodes.values().reduce((cols, node) => {
			const colIndex = node.idx % this.n;
			if (!cols[colIndex]) {
				cols[colIndex] = [];
			}
			cols[colIndex].push(node);
			return cols;
		}, [] as Node[][]);
	}

	public setColorName(color: number, name: string) {
		if (!this.colors.has(color)) {
			throw new Error(`Color ${color} does not exist in the graph.`);
		}
		this.colorNames.set(color, name);
	}

	public addNode(idx: number, color: number) {
		const colorSet = this.colors.get(color);
		if (!colorSet) {
			throw new Error(`Color ${color} does not exist in the graph.`);
		}
		this.nodes.set(idx, new Node(idx, color));
		colorSet.add(idx);
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

	public createEdges() {
		for (let column = 0; column < this.n; column++) {
			for (let row = 0; row < this.n; row++) {
				const idx = row * this.n + column;
				const currentNode = this.nodes.get(idx);
				if (!currentNode) {
					throw new Error(`Node ${idx} does not exist in the graph.`);
				}

				// Add node to the color set
				const colorSet = this.colors.get(currentNode.color);
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

	private removeNode(node: Node) {
		this.nodes.delete(node.idx);
		this.colors.get(node.color)?.delete(node.idx);
	}

	private removeNodeAndNeighbors(node: Node) {
		this.removeNode(node);
		for (const edge of node.edges) {
			const edgeNode = this.nodes.get(edge);
			if (edgeNode) {
				this.removeNode(edgeNode);
			}
		}
	}

	public placeQueen(nodeNumber: number) {
		const node = this.nodes.get(nodeNumber);
		if (!node) {
			throw new Error(`Node ${nodeNumber} does not exist in the graph.`);
		}
		this.removeNodeAndNeighbors(node);
	}

	public getNodes(): Map<number, Node> {
		return this.nodes;
	}

	public getColors(): Map<number, Set<number>> {
		return this.colors;
	}

	public getColorSet(color: number): Set<number> {
		const colorSet = this.colors.get(color);
		if (!colorSet) {
			throw new Error(`Color ${color} does not exist in the graph.`);
		}
		return colorSet;
	}
}

class Node {
	public idx: number;
	public color: number;
	public edges: Set<number> = new Set<number>();

	constructor(idx: number, color: number) {
		this.idx = idx;
		this.color = color;
	}

	public addEdge(nodeNumber: number) {
		this.edges.add(nodeNumber);
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
				graph.addNode(idx, color);
				graph.setColorName(color, colorName.trim());
			}),
		);

		graph.createEdges();
		// graph.print();
		// graph.printColors();
		graph.placeQueen(41);
		await SearchGraph(graph);
		graph.print();
		graph.printColors();
		console.log(graph.rows());
		await page.pause();
	});
};

async function SearchGraph(graph: Graph) {
	for (const [color, nodes] of graph.getColors()) {
		if (nodes.size === 1) {
			const idx = nodes.values().next().value;
			if (idx === undefined) {
				throw new Error(`No node found for color ${color}`);
			}
			graph.placeQueen(idx);
		}
	}
}

/*
0 1 2 3
4 5 6 7
8 9 10 11
12 13 14 15
*/

export default PlayQueens;
