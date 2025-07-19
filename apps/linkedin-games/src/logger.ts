import config from "#config";

// #region Constants

const logLevels = [
	"none",
	"fatal",
	"error",
	"warn",
	"normal",
	"debug",
	"trace",
] as const;

export { logLevels };

// #endregion

enum LogLevelFlags {
	None = 0,
	Fatal = 1 << 0,
	Error = 1 << 1,
	Warn = 1 << 2,
	Normal = 1 << 3,
	Debug = 1 << 4,
	Trace = 1 << 5,
}

// #region Types

type LogLevel = (typeof logLevels)[number];
type LogLevelBitmap = number;

/**
 * Logger interface
 */
type ILogger = {
	trace: (...args: unknown[]) => void;
	debug: (...args: unknown[]) => void;
	log: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
	fatal: (...args: unknown[]) => void;
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

	private _logLevel: LogLevel = "trace";

	public fatal(...args: unknown[]): void {
		if (this._logLevel !== "none") {
			console.error(...args);
		}
	}

	public error(...args: unknown[]): void {
		if (this._logLevel !== "none") {
			console.error(...args);
		}
	}

	public warn(...args: unknown[]): void {
		if (this._logLevel in ["warn", "normal", "debug"]) {
			console.warn(...args);
		}
	}

	public log(...args: unknown[]): void {
		if (this._logLevel in ["normal", "debug"]) {
			console.log(...args);
		}
	}

	public debug(...args: unknown[]): void {
		if (this._logLevel === "debug") {
			console.log(...args);
		}
	}

	public trace(...args: unknown[]): void {
		if (this._logLevel === "trace") {
			console.log(...args);
		}
	}

	public setLogLevel(level: LogLevel | number): void {
		if (typeof level === "string") {
			this._logLevel = level;
		} else {
			this._logLevel = logLevels[level] ?? "normal";
		}
	}
}

const logger: ILogger = Logger.instance;
export default logger;

// #endregion
