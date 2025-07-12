import type { IGraph } from "../graph";

type IPageController = {
	start(): Promise<void>;
	populateGraph(graph: IGraph): Promise<void>;
	dispose(): Promise<void>;
	[Symbol.dispose](): void;
	[Symbol.asyncDispose](): Promise<void>;
};

export type { IPageController };
