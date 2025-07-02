const logLevels = ["none", "debug", "error"] as const;

export interface Config {
	headless: boolean;
	logLevel: (typeof logLevels)[number];
	interactive: boolean;
	Urls: {
		Queens: string;
	};
	Queens: {
		placePreExistingQueens: boolean;
	};
}

const isValidLogLevel = (level?: string): level is Config["logLevel"] =>
	logLevels.includes(level as Config["logLevel"]);

const logLevel = isValidLogLevel(process.env.LOG_LEVEL)
	? (process.env.LOG_LEVEL as Config["logLevel"])
	: "error";

export default {
	headless: false,
	logLevel,
	interactive: true,
	Urls: {
		Queens: "https://www.linkedin.com/games/view/queens/desktop",
	},
	Queens: {
		placePreExistingQueens: true,
	},
} satisfies Config;
