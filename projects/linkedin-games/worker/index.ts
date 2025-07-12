import { DurableObject } from "cloudflare:workers";
import { PageController } from "../src/queens/page-controller/cloudflare";
import { PlayQueens } from "../src/queens/index";
import { logger } from "#utils/Logger";
import { ConfigSingleton, type EnvironmentConfig } from "#config";
import type { GameData } from "#src/queens/types.ts";

export class Storage extends DurableObject<Env> {
	private _currentAnswer!: GameData;
	public constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		ctx.blockConcurrencyWhile(async () => {
			this._currentAnswer = (await ctx.storage.get<GameData>("today")) || {
				sideLength: 0,
				queens: [],
				colors: [],
				nodesColors: [],
			};
		});
	}

	public async getCurrentAnswer() {
		return this._currentAnswer;
	}

	public async storeResult(result: GameData): Promise<void> {
		const date = new Date().toLocaleDateString();
		this.ctx.storage.put("today", result);
		this.ctx.storage.put(date, result);
		this._currentAnswer = result;
	}
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		ConfigSingleton.env = env as EnvironmentConfig;

		if (new URL(request.url).pathname === "/cron") {
			const scheduled =
				this.scheduled ||
				(async (
					controller: ScheduledController,
					env: Env,
					ctx: ExecutionContext,
				) => Promise.resolve());
			await scheduled({} as ScheduledController, env, ctx);
			return new Response("Scheduled task executed successfully.");
		}

		const id = env.STORAGE.idFromName("queens-storage");
		const storage = env.STORAGE.get(id);
		const body = await storage.getCurrentAnswer();
		return new Response(JSON.stringify(body), {
			headers: {
				"Content-Type": "application/json",
			},
		});
	},
	async scheduled(controller, env, ctx) {
		try {
			ConfigSingleton.env = env as EnvironmentConfig;
			logger.debug("Creating PageController...");
			const pageController = await PageController(env.BROWSER);
			logger.debug("Calling PlayQueens...");
			const gameData = await PlayQueens({ pageController });
			logger.debug("Queen Game Data:", gameData);
			const id = env.STORAGE.idFromName("queens-storage");
			const storage = env.STORAGE.get(id);
			logger.debug("Storing result in Durable Object...");
			await storage.storeResult(gameData);
			logger.debug("Result stored successfully.");
		} catch (error) {
			console.error("Error with schedule:", error);
			throw error;
		}
	},
} satisfies ExportedHandler<Env>;
