import config from "#config";

// #region Constants

const logLevels = ["none", "error", "warn", "normal", "debug"] as const;

export { logLevels };

// #endregion

// #region Types

type LogLevel = (typeof logLevels)[number];

/**
 * Logger interface
 */
type ILogger = {
	debug: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	log: (...args: unknown[]) => void;
} & {};

export type { LogLevel, ILogger };

// #endregion

// #region Logger

class Logger implements ILogger {
	private constructor() {}
	private static _instance: Logger = new Logger();
	public static get instance(): Logger {
		return Logger._instance;
	}

	public error(...args: unknown[]): void {
		if (config.logLevel !== "none") {
			console.error(...args);
		}
	}

	public warn(...args: unknown[]): void {
		if (config.logLevel in ["warn", "normal", "debug"]) {
			console.warn(...args);
		}
	}

	public log(...args: unknown[]): void {
		if (config.logLevel in ["normal", "debug"]) {
			console.log(...args);
		}
	}

	public debug(...args: unknown[]): void {
		if (config.logLevel === "debug") {
			console.log(...args);
		}
	}
}

const logger: ILogger = Logger.instance;

export { logger };

// #endregion
