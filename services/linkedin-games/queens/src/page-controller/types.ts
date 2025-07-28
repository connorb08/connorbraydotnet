import type { Graph } from "../graph";

type IPageController = {
	start(): Promise<void>;
	constructGraph(graph: Graph): Promise<void>;
	dispose(): Promise<void>;
	[Symbol.dispose](): void;
	[Symbol.asyncDispose](): Promise<void>;
};

export type { IPageController };
