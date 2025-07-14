import { type LogLevel, logLevels } from "#logger";

// #region Types

type EnvironmentConfig = {
	LOG_LEVEL?: string | undefined;
};

type Config = {
	readonly headless: boolean;
	readonly logLevel: LogLevel;
	readonly Urls: {
		readonly Queens: string;
	};
	env: EnvironmentConfig;
};

export type { Config };

// #endregion

const defaultConfig = {
	headless: true,
	logLevel: "normal",
	Urls: {
		Queens: "https://www.linkedin.com/games/view/queens/desktop",
	},
	env: {},
} satisfies Config;

class Singleton {
	private static _instance: Singleton = new Singleton();
	private static _logLevel: LogLevel = defaultConfig.logLevel;
	private static _headless: boolean = defaultConfig.headless;
	private static _Urls: {
		Queens: string;
	} = defaultConfig.Urls;

	private constructor() {}

	static get instance(): Singleton {
		return Singleton._instance;
	}

	static get headless(): boolean {
		return Singleton._headless;
	}

	static get logLevel() {
		return Singleton._logLevel;
	}

	static get Urls() {
		return Singleton._Urls;
	}

	static set env(env: EnvironmentConfig) {
		Singleton._logLevel = logLevels.includes(env.LOG_LEVEL as LogLevel)
			? (env.LOG_LEVEL as LogLevel)
			: Singleton._logLevel;
	}
}

const config: Config = Singleton;

export default config;
