import { DurableObject, WorkerEntrypoint } from "cloudflare:workers";
import logger from "clog";
import { createRequestHandler } from "react-router";
import type { GameData } from "shared";
import { SolutionFactory } from "#src/factory";
import { PageController } from "#src/page-controller/cloudflare";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const requestHandler = createRequestHandler(
	// @ts-expect-error virtual module for react-router server build
	() => import("virtual:react-router/server-build"),
	// @ts-expect-error vite environment variable
	import.meta.env.MODE,
);

const defaultGameData: GameData = {
	sideLength: 0,
	colors: [],
	cellColors: [],
	cellsRemoved: [],
	queenPositions: [],
};

export class Storage extends DurableObject<Env> {
	#queenSolution!: GameData;
	public constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		ctx.blockConcurrencyWhile(async () => {
			this.#queenSolution =
				(await ctx.storage.get<GameData>("today")) || defaultGameData;
		});
	}

	public async getQueenSolution() {
		return this.#queenSolution;
	}

	public async storeResult(result: GameData): Promise<void> {
		const date = new Date().toLocaleDateString();
		this.ctx.storage.put("today", result);
		this.ctx.storage.put(date, result);
		this.#queenSolution = result;
	}
}

export class Entrypoint extends WorkerEntrypoint<Env> {
	public override async fetch(request: Request): Promise<Response> {
		return requestHandler(request, {
			cloudflare: { env: this.env, ctx: this.ctx },
		});
	}

	public async getResult(): Promise<GameData> {
		const storage = this.env.STORAGE.get(
			this.env.STORAGE.idFromName("default"),
		);
		return storage.getQueenSolution();
	}

	public async solve(): Promise<GameData> {
		return await SolutionFactory({
			pageController: await PageController(this.env.BROWSER),
		});
	}

	override async scheduled(_: ScheduledController): Promise<void> {
		try {
			const gameData = await this.solve();
			await this.env.STORAGE.get(
				this.env.STORAGE.idFromName("default"),
			).storeResult(gameData);
			logger.debug("Game solved and result stored successfully.");
		} catch (error) {
			logger.error("Error solving game:", error);
		}
	}
}

export default Entrypoint;
