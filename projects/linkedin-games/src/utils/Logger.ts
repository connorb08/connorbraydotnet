import config from "#config";

// #region Constants

const logLevels = ["none", "debug", "error"] as const;

export { logLevels };

// #endregion

// #region Types

type LogLevel = (typeof logLevels)[number];

type ILogger = {
	debug: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
};

export type { LogLevel, ILogger };

// #endregion

// #region Logger

class Logger implements ILogger {
	private constructor() {}
	private static _instance: Logger = new Logger();
	public static get instance(): Logger {
		return Logger._instance;
	}

	public debug(...args: unknown[]): void {
		if (config.logLevel === "debug") {
			console.log(...args);
		}
	}

	public warn(...args: unknown[]): void {
		if (config.logLevel !== "none") {
			console.warn(...args);
		}
	}

	public error(...args: unknown[]): void {
		if (config.logLevel !== "none") {
			console.error(...args);
		}
	}
}

const logger = Logger.instance;

export { logger };
export default logger;

// #endregion
