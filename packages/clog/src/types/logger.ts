import type { LogFormat, LogLevel } from "./config";

type ILogger = {
	// Properties
	level: LogLevel;
	format: LogFormat;

	// Methods
	/**
	 * Logs a message at the critical level.
	 * This is used for critical errors that cause the application to terminate.
	 * @param args Arguments to log at the critical level.
	 */
	logCritical(...args: unknown[]): void;
	/**
	 * Logs an error message at the error level.
	 * @param args Arguments to log at the error level.
	 */
	logError(...args: unknown[]): void;
	/**
	 * Logs a warning message at the warn level.
	 * @param args Arguments to log at the warn level.
	 */
	logWarning(...args: unknown[]): void;
	/**
	 * Logs a message at the info level.
	 * @param args Arguments to log at the info level.
	 */
	logInformation(...args: unknown[]): void;
	/**
	 * Logs a debug message at the debug level.
	 * @param args Arguments to log at the debug level.
	 */
	logDebug(...args: unknown[]): void;
	/**
	 * Logs a trace message at the trace level.
	 * @param args Arguments to log at the trace level.
	 */
	logTrace(...args: unknown[]): void;
} & {};

export type { ILogger };
