import type { ClogConfig } from "#types";

// Defaults
const defaults = {
	level: "Information",
	format: "text",
	output: "console",
	formatter: (logLevel, ...args) =>
		`${logLevel.toUpperCase()}: ${args.join(" ")}`,
} satisfies ClogConfig;

export { defaults };

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
