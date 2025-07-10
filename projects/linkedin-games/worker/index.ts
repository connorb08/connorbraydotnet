import { DurableObject } from "cloudflare:workers";
import { PageController } from "../src/queens/page-controller/cloudflare";
import { PlayQueens } from "../src/queens/index";
import { logger } from "#utils/Logger";
import { ConfigSingleton, type EnvironmentConfig } from "#config";

export class Storage extends DurableObject<Env> {
	// #region Constructor

	public constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		ctx.blockConcurrencyWhile(async () => {
			this._currentAnswer = (await ctx.storage.get<string>("result")) || "";
		});
		this._currentAnswer ||= "No result stored.";
	}

	// #endregion

	// #region Instance Variables

	private _currentAnswer: string;

	// #endregion

	// #region Methods

	public async getCurrentAnswer() {
		if (this._currentAnswer) {
			return this._currentAnswer;
		}
		this._currentAnswer =
			(await this.ctx.storage.get<string>("result")) || "[]";
		return this._currentAnswer;
	}

	public async storeResult(result: string): Promise<void> {
		this.ctx.storage.put("result", result);
		this._currentAnswer = result;
	}

	// #endregion
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
		return new Response(body, {
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
			const queenLocations = await PlayQueens({ pageController });
			logger.debug("Queen Locations:", queenLocations);
			const id = env.STORAGE.idFromName("queens-storage");
			const storage = env.STORAGE.get(id);
			logger.debug("Storing result in Durable Object...");
			await storage.storeResult(JSON.stringify(queenLocations));
			logger.debug("Result stored successfully.");
		} catch (error) {
			console.error("Error with schedule:", error);
			throw error;
		}
	},
} satisfies ExportedHandler<Env>;
