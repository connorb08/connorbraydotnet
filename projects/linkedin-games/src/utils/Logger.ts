import config from "#root/config.ts";
import type { Logger } from "#types";

const LoggerClosure: Logger = (
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

const logger = LoggerClosure({
	logLevel: "debug",
});

export { logger };
