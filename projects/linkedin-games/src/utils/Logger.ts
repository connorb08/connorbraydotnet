import config from "#root/config.ts";
import type { Logger } from "#types";

const LoggerClosure: Logger = (
	{ logLevel = config.logLevel } = {
		logLevel: config.logLevel,
	},
) => {
	function debug(...args: unknown[]) {
		if (logLevel !== "debug") {
			return;
		}
		console.log(...args);
	}

	function warn(...args: unknown[]) {
		if (logLevel === "none") {
			return;
		}
		console.warn(...args);
	}

	function error(...args: unknown[]) {
		if (logLevel === "none") {
			return;
		}
		console.error(...args);
	}

	return {
		debug,
		warn,
		error,
	};
};

const logger = LoggerClosure({
	logLevel: "debug",
});

export { logger };
