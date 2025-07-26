/** biome-ignore-all lint/style/noNonNullAssertion: singleton pattern - #instance is guaranteed to be assigned */
import type { BaseLogLevel, ILogger } from "#types";

export enum LogLevel {
	Fatal = 1 << 1,
	Error = 1 << 2,
	Warn = 1 << 3,
	Info = 1 << 4,
	Debug = 1 << 5,
	Trace = 1 << 6,
}

const defaultLogLevel: BaseLogLevel = "info";

const noLoggingConfig: InternalLogLevelConfig = {
	fatal: false,
	error: false,
	warn: false,
	info: false,
	debug: false,
	trace: false,
};

class Logger implements ILogger {
	// #region Singleton Pattern

	static #instance: Logger = null!;
	static #blockConstruction = true;

	public static get instance(): Logger {
		if (Logger.#instance === null) {
			Logger.#blockConstruction = false;
			Logger.#instance = new Logger();
		}
		return Logger.#instance;
	}

	private constructor() {
		if (Logger.#blockConstruction) {
			throw new TypeError("Logger is not constructable");
		}
		Logger.#blockConstruction = true;
		this.#setBaseLogLevel(defaultLogLevel);
		this.#logLevel = defaultLogLevel;
	}

	// #endregion Singleton Pattern

	// #region Private Properties

	#logLevel: BaseLogLevel = "custom";
	#loggerConfig: InternalLogLevelConfig = noLoggingConfig;

	// #endregion Private Properties

	// #region Private Methods

	#setBaseLogLevel(level: BaseLogLevel): void {
		switch (level) {
			case "none":
				this.#loggerConfig = {
					...noLoggingConfig,
				};
				return;
			case "fatal":
				this.#loggerConfig = {
					...noLoggingConfig,
					fatal: true,
				};
				return;
			case "error":
				this.#loggerConfig = {
					...noLoggingConfig,
					fatal: true,
					error: true,
				};
				return;
			case "warn":
				this.#loggerConfig = {
					...noLoggingConfig,
					fatal: true,
					error: true,
					warn: true,
				};
				return;
			case "info":
				this.#loggerConfig = {
					...noLoggingConfig,
					fatal: true,
					error: true,
					warn: true,
					info: true,
				};
				return;
			case "debug":
				this.#loggerConfig = {
					...noLoggingConfig,
					fatal: true,
					error: true,
					warn: true,
					info: true,
					debug: true,
				};
				return;
			case "trace":
				this.#loggerConfig = {
					...noLoggingConfig,
					fatal: true,
					error: true,
					warn: true,
					info: true,
					debug: true,
					trace: true,
				};
				return;
			default:
				throw new Error(`Unknown log level: ${level}`);
		}
	}

	// #endregion Private Methods

	// #region Public Getters

	public get logLevel(): BaseLogLevel {
		return this.#logLevel;
	}

	public get customLogLevel(): InternalLogLevelConfig {
		return this.#loggerConfig;
	}

	// #endregion Public Getters

	// #region Public Setters

	public set logLevel(level: Exclude<BaseLogLevel, "custom">) {
		this.#setBaseLogLevel(level);
		this.#logLevel = level;
	}

	public set customLogLevel(bitmask: LogLevel) {
		this.#loggerConfig = {
			fatal: Boolean(bitmask & LogLevel.Fatal),
			error: Boolean(bitmask & LogLevel.Error),
			warn: Boolean(bitmask & LogLevel.Warn),
			info: Boolean(bitmask & LogLevel.Info),
			debug: Boolean(bitmask & LogLevel.Debug),
			trace: Boolean(bitmask & LogLevel.Trace),
		};
		this.#logLevel = "custom";
	}

	// #endregion Public Setters

	// #region Logging Methods

	public fatal(...args: unknown[]): void {
		if (this.#loggerConfig.fatal) {
			console.error(...args);
		}
	}

	public error(...args: unknown[]): void {
		if (this.#loggerConfig.error) {
			console.error(...args);
		}
	}

	public warn(...args: unknown[]): void {
		if (this.#loggerConfig.warn) {
			console.warn(...args);
		}
	}

	public info(...args: unknown[]): void {
		if (this.#loggerConfig.info) {
			console.info(...args);
		}
	}

	public log(...args: unknown[]): void {
		if (this.#loggerConfig.info) {
			console.log(...args);
		}
	}

	public debug(...args: unknown[]): void {
		if (this.#loggerConfig.debug) {
			console.debug(...args);
		}
	}

	public trace(...args: unknown[]): void {
		if (this.#loggerConfig.trace) {
			console.trace(...args);
		}
	}

	// #endregion Logging Methods
}

export default Logger.instance as ILogger;

// #region Types

type InternalLogLevelConfig = {
	[key in Exclude<BaseLogLevel, "none" | "custom">]: boolean;
};

// #endregion Types
