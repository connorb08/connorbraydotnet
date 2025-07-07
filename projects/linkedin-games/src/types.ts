import type { Config } from "#config";

interface LoggerOptions {
	logLevel?: Config["logLevel"];
}

type Logger = ({ logLevel }?: LoggerOptions) => {
	debug: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
};

export type { Logger, LoggerOptions };
