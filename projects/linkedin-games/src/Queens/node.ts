import type { IGraphNode } from "./types";

export class GraphNode implements IGraphNode {
	private readonly _id: number;
	public readonly _row: number;
	private readonly _column: number;
	private readonly _color: number;
	private readonly _edges: Set<number> = new Set<number>();
	public removed = false;

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

	public async addEdge(node: GraphNode | number) {
		this._edges.add(typeof node === "number" ? node : node.id);
	}

	public addEdgeById(nodeId: number): void {
		this._edges.add(nodeId);
	}
}
