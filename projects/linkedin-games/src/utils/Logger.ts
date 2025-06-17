import config, { type Config } from "#config";

interface LoggerOptions {
	logLevel?: Config["logLevel"];
}

type Logger = ({ logLevel }?: LoggerOptions) => {
	debug: (message: string, ...args: unknown[]) => void;
	error: (message: string, ...args: unknown[]) => void;
};

export const Logger: Logger = (
	{ logLevel = config.logLevel } = {
		logLevel: config.logLevel,
	},
) => {
	function debug(message: string, ...args: unknown[]) {
		if (logLevel !== "debug") {
			return;
		}
		console.log(message, ...args);
	}

	function error(message: string, ...args: unknown[]) {
		if (logLevel === "none") {
			return;
		}
		console.error(message, ...args);
	}

	return {
		debug,
		error,
	};
};
