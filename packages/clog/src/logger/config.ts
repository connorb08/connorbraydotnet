import type { LogLevel } from "#types";

export type LogFormat = "text" | "json" | "xml" | "markdown" | "csv" | "yaml";

export type ClogConfig = {
	level: LogLevel;
	customLevel: LogLevel;
	format: LogFormat;
};

// Features?

// Log Levels (e.g., trace, debug, info, warn, error, fatal)

// Supports filtering logs based on severity.

// Log Formatting

// Timestamps, levels, file/line context.

// Optional color coding (especially for CLI).

// Output Destinations

// Console (default).

// File (Node.js).

// Remote server / HTTP endpoint (e.g., for error reporting).

// Asynchronous Logging

// Non-blocking I/O for file or remote logs.

// Configurable

// Runtime configuration (level, format, destination).

// Environment-based configs (development, production).
