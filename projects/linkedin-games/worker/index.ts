/** biome-ignore-all lint/style/noDefaultExport: worker file */
import { DurableObject } from "cloudflare:workers";
import config from "#config";
import { SolutionManager } from "#src/queens/manager.ts";
import { PageController } from "#src/queens/page-controller/cloudflare.ts";
import type { GameData } from "#src/queens/types.ts";
import { logger } from "#utils/Logger";

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
				removed: [],
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
		config.env = {
			LOG_LEVEL: env.LOG_LEVEL,
		};

		if (new URL(request.url).pathname === "/cron") {
			await this.scheduled?.({} as ScheduledController, env, ctx);
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
	async scheduled(
		_controllerr: ScheduledController,
		env: Env,
		_ctxx: ExecutionContext,
	) {
		try {
			const gameData = await SolutionManager({
				pageController: await PageController(env.BROWSER),
			});
			await env.STORAGE.get(env.STORAGE.idFromName("default")).storeResult(
				gameData,
			);
			logger.debug("Result stored successfully.");
		} catch (error) {
			console.error("Error with schedule:", error);
			throw error;
		}
	},
} satisfies ExportedHandler<Env>;
