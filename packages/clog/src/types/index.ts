type BaseLogLevel =
	| "none"
	| "custom"
	| "fatal"
	| "error"
	| "warn"
	| "info"
	| "debug"
	| "trace";

type ILogger = {
	fatal: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	log: (...args: unknown[]) => void;
	info: (...args: unknown[]) => void;
	debug: (...args: unknown[]) => void;
	trace: (...args: unknown[]) => void;
} & {};

export type { BaseLogLevel, ILogger };
