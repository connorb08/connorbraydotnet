type LogLevel =
	| "none"
	| "custom"
	| "fatal"
	| "error"
	| "warn"
	| "info"
	| "debug"
	| "trace";

type ILogger = {
	// Properties
	readonly logLevel: LogLevel;

	// Methods
	/**
	 * Logs a message at the fatal level.
	 * This is used for critical errors that cause the application to terminate.
	 * @param args Arguments to log at the fatal level.
	 */
	fatal(...args: unknown[]): void;
	error(...args: unknown[]): void;
	warn(...args: unknown[]): void;
	log(...args: unknown[]): void;
	info(...args: unknown[]): void;
	debug(...args: unknown[]): void;
	trace(...args: unknown[]): void;
} & {};

export type { LogLevel, ILogger };
