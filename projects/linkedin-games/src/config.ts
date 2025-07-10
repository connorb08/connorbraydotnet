import { logLevels, type LogLevel } from "#utils/Logger";

// #region Types

type EnvironmentConfig = {
	LOG_LEVEL?: string | undefined;
};

type IConfig = {
	logLevel: LogLevel;
	Urls: {
		Queens: string;
	};
};

export type { EnvironmentConfig, IConfig };

// #endregion

const defaultConfig = {
	logLevel: "error",
	Urls: {
		Queens: "https://www.linkedin.com/games/view/queens/desktop",
	},
} satisfies IConfig;

class ConfigSingleton {
	private static _instance: ConfigSingleton = new ConfigSingleton();
	private _config: IConfig;

	private constructor() {
		if (ConfigSingleton._instance) {
			throw new Error("Error creating singleton instance of Config.");
		}
		ConfigSingleton._instance = this;
		this._config = defaultConfig;
	}

	static get data(): IConfig {
		return ConfigSingleton._instance._config;
	}

	static set env(env: EnvironmentConfig) {
		ConfigSingleton._instance._config.logLevel = logLevels.includes(
			env.LOG_LEVEL as LogLevel,
		)
			? (env.LOG_LEVEL as LogLevel)
			: ConfigSingleton._instance._config.logLevel;
	}
}

const config = ConfigSingleton.data;

export { config, ConfigSingleton };
export default config;
