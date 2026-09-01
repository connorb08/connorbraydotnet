/** biome-ignore-all lint/style/noNonNullAssertion: singleton pattern - #instance is guaranteed to be assigned */
import type { ILogger, LogLevel } from "#types";
// import { ClogEnv, EnvironmentVars } from "../environment/variables";
import { logError } from "./methods/error";

export const LogLevels = {
	Fatal: 0b1,
	Error: 0b10,
	Warn: 0b100,
	Info: 0b1000,
	Debug: 0b10000,
	Trace: 0b100000,
} as const;

const defaultLogLevel: LogLevel = "info";
// (EnvironmentVars[ClogEnv.LogLevel] as LogLevel) ?? "info";

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

	#logLevel: LogLevel = "custom";
	#loggerConfig: InternalLogLevelConfig = noLoggingConfig;

	// #endregion Private Properties

	// #region Private Methods

	#setBaseLogLevel(level: LogLevel): void {
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
			case "all":
				this.#loggerConfig = {
					fatal: true,
					error: true,
					warn: true,
					info: true,
					debug: true,
					trace: true,
				};
				return;
			case "custom":
				return;
			default:
				throw new Error(`Unknown log level: ${level}`);
		}
	}

	// #endregion Private Methods

	// #region Public Getters

	public get logLevel(): LogLevel {
		return this.#logLevel;
	}

	public get customLogLevel(): InternalLogLevelConfig {
		return this.#loggerConfig;
	}

	// #endregion Public Getters

	// #region Public Setters

	public set logLevel(level: Exclude<LogLevel, "custom">) {
		if (level === undefined) {
			return;
		}
		this.#setBaseLogLevel(level);
		this.#logLevel = level;
	}

	public set customLogLevel(bitmask: number) {
		this.#loggerConfig = {
			fatal: Boolean(bitmask & LogLevels.Fatal),
			error: Boolean(bitmask & LogLevels.Error),
			warn: Boolean(bitmask & LogLevels.Warn),
			info: Boolean(bitmask & LogLevels.Info),
			debug: Boolean(bitmask & LogLevels.Debug),
			trace: Boolean(bitmask & LogLevels.Trace),
		};
		this.#logLevel = "custom";
	}

	// #endregion Public Setters

	// #region Logging Methods

	public fatal(...args: unknown[]): void {
		if (this.#loggerConfig.fatal) {
			console.error("FATAL:", ...args);
		}
	}

	public error(errorMessage: string, ...args: unknown[]): void {
		if (this.#loggerConfig.error) {
			logError(this.error, errorMessage, ...args);
		}
	}

	public warn(...args: unknown[]): void {
		if (this.#loggerConfig.warn) {
			console.warn("WARN:", ...args);
		}
	}

	public info(...args: unknown[]): void {
		if (this.#loggerConfig.info) {
			console.info("INFO:", ...args);
		}
	}

	public log(...args: unknown[]): void {
		if (this.#loggerConfig.info) {
			console.log("INFO:", ...args);
		}
	}

	public debug(...args: unknown[]): void {
		if (this.#loggerConfig.debug) {
			console.debug("DEBUG:", ...args);
		}
	}

	public trace(...args: unknown[]): void {
		if (this.#loggerConfig.trace) {
			console.trace("TRACE:", ...args);
		}
	}

	// #endregion Logging Methods
}

export default Logger.instance as ILogger;

// #region Types

type InternalLogLevelConfig = {
	[key in Exclude<LogLevel, "none" | "custom" | "all">]: boolean;
};

// #endregion Types
