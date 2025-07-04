const logLevels = ["none", "debug", "error"] as const;

export interface Config {
	headless: boolean;
	logLevel: (typeof logLevels)[number];
	Urls: {
		Queens: string;
	};
}

const defaultConfig: Config = {
	headless: false,
	logLevel: "debug",
	Urls: {
		Queens: "https://www.linkedin.com/games/view/queens/desktop",
	},
};

const getHeadless = (): Config["headless"] => {
	if (
		process.env.HEADLESS &&
		["true", "false"].includes(process.env.HEADLESS)
	) {
		return process.env.HEADLESS === "true";
	}
	return defaultConfig.headless;
};

const getLogLevel = (): Config["logLevel"] => {
	if (
		process.env.LOG_LEVEL &&
		logLevels.includes(process.env.LOG_LEVEL as Config["logLevel"])
	) {
		return process.env.LOG_LEVEL as Config["logLevel"];
	}
	return defaultConfig.logLevel;
};

const config = {
	headless: getHeadless(),
	logLevel: getLogLevel(),
	interactive: true,
	Urls: {
		Queens: defaultConfig.Urls.Queens,
	},
} satisfies Config & {
	interactive: boolean;
};

export default config;
