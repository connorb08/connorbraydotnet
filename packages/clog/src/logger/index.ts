import type { LogFormatter, LogOutput } from "#src/types/config";
import type { ClogConfig, ILogger, LogFormat, LogLevel } from "#types";
import { defaults } from "./config";

export const LogLevels: Record<LogLevel, number> = {
	None: 0b0,
	Critical: 0b1,
	Error: 0b10,
	Warning: 0b100,
	Information: 0b1000,
	Debug: 0b10000,
	Trace: 0b100000,
} as const;

export class Logger implements ILogger {
	#level: LogLevel;
	#format: LogFormat;
	#formatter: LogFormatter;
	#output: LogOutput;

	public constructor(config: Partial<ClogConfig>) {
		this.#level = config.level ?? defaults.level;
		this.#format = config.format ?? defaults.format;
		this.#formatter = config.formatter ?? defaults.formatter;
		this.#output = config.output ?? defaults.output;
	}

	public get level(): LogLevel {
		return this.#level;
	}

	public get format(): LogFormat {
		return this.#format;
	}

	public set level(level: LogLevel) {
		this.#level = level;
	}

	public set format(format: LogFormat) {
		this.#format = format;
	}

	// #region Critical

	public logCritical(...args: unknown[]): void {
		if (LogLevels[this.#level] >= LogLevels.Critical) {
			this.log("Critical", ...args);
		}
	}

	// #endregion Critical

	// #region Error

	public logError(...args: unknown[]): void {
		if (LogLevels[this.#level] >= LogLevels.Error) {
			this.log("Error", ...args);
		}
	}

	// #endregion Error

	// #region Warn

	public logWarning(...args: unknown[]): void {
		if (LogLevels[this.#level] >= LogLevels.Warning) {
			this.log("Warning", ...args);
		}
	}

	// #endregion Warn

	// #region Info

	public logInformation(...args: unknown[]): void {
		if (LogLevels[this.#level] >= LogLevels.Information) {
			this.log("Information", ...args);
		}
	}

	// #endregion Info

	// #region Debug

	public logDebug(...args: unknown[]): void {
		if (LogLevels[this.#level] >= LogLevels.Debug) {
			this.log("Debug", ...args);
		}
	}

	// #endregion Debug

	// #region Trace

	public logTrace(...args: unknown[]): void {
		if (LogLevels[this.#level] >= LogLevels.Trace) {
			this.log("Trace", ...args);
		}
	}

	// #endregion Trace

	private log(level: LogLevel, ...args: unknown[]): void {
		if (this.#output === "console") {
			this.logConsole(this.#formatter(level, ...args));
		}
	}

	private logConsole(...args: unknown[]): void {
		console.log(...args);
	}
}
