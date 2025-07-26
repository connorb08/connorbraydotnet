import { DurableObject, WorkerEntrypoint } from "cloudflare:workers";
import logger from "clog";
import type { GameData } from "shared";
import { SolutionFactory } from "../src/factory";
import { PageController } from "../src/page-controller/cloudflare";

const defaultGameData: GameData = {
	sideLength: 0,
	colorNames: [],
	cellColors: [],
	cellsRemoved: [],
	queenPositions: [],
};

export class Storage extends DurableObject<Env> {
	private _currentAnswer!: GameData;
	public constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		ctx.blockConcurrencyWhile(async () => {
			this._currentAnswer =
				(await ctx.storage.get<GameData>("today")) || defaultGameData;
		});
	}

	public async getCurrentAnswer() {
		return this._currentAnswer;
	}

	public async getAnswerByDate(date: string): Promise<GameData> {
		return (await this.ctx.storage.get<GameData>(date)) || defaultGameData;
	}

	public async storeResult(result: GameData): Promise<void> {
		const date = new Date().toLocaleDateString();
		this.ctx.storage.put("today", result);
		this.ctx.storage.put(date, result);
		this._currentAnswer = result;
	}
}

export default class Entrypoint extends WorkerEntrypoint<Env> {
	public async getResult(date?: string | undefined): Promise<GameData> {
		const storage = this.env.STORAGE.get(
			this.env.STORAGE.idFromName("default"),
		);
		if (date) {
			return storage.getAnswerByDate(date);
		}
		return storage.getCurrentAnswer();
	}

	async #solveGame(): Promise<boolean> {
		try {
			logger.logLevel = this.env.LOG_LEVEL;
			const gameData = await SolutionFactory({
				pageController: await PageController(this.env.BROWSER),
			});
			await this.env.STORAGE.get(
				this.env.STORAGE.idFromName("default"),
			).storeResult(gameData);
			logger.debug("Game solved and result stored successfully.");
			return true;
		} catch (error) {
			logger.error("Error solving game:", error);
			return false;
		}
	}

	override async scheduled(_: ScheduledController): Promise<void> {
		await this.#solveGame();
	}
}
