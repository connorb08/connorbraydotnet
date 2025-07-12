/** biome-ignore-all lint/style/noDefaultExport: allow config to be exported */
import { type LogLevel, logLevels } from "#src/logger.ts";

// #region Types

type EnvironmentConfig = {
	LOG_LEVEL?: string | undefined;
};

type Config = {
	readonly logLevel: LogLevel;
	readonly Urls: {
		readonly Queens: string;
	};
	env: EnvironmentConfig;
};

export type { Config };

// #endregion

const defaultConfig = {
	logLevel: "normal",
	Urls: {
		Queens: "https://www.linkedin.com/games/view/queens/desktop",
	},
	env: {},
} satisfies Config;

class Singleton {
	// private static _instance: Singleton = new Singleton();
	private static _logLevel: LogLevel = defaultConfig.logLevel;
	private static _Urls: {
		Queens: string;
	} = defaultConfig.Urls;
	// private static _env: EnvironmentConfig = defaultConfig.env;

	private constructor() {
		// if (ConfigSingleton._instance) {
		// 	throw new Error("Error creating singleton instance of Config.");
		// }
		// ConfigSingleton._instance = this;
		// this._config = {
		// 	...defaultConfig,
		// };
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

// const config: ConfigObject = {
// 	...ConfigSingleton.data,
// 	env: ConfigSingleton.env,
// };

const config = Singleton;

export default config;
