import type { Config } from "#root/config.ts";

interface LoggerOptions {
	logLevel?: Config["logLevel"];
}

type Logger = ({ logLevel }?: LoggerOptions) => {
	debug: (message: string, ...args: unknown[]) => void;
	error: (message: string, ...args: unknown[]) => void;
};

export type { Logger, LoggerOptions };
