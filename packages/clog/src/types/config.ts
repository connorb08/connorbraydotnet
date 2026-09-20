type LogFormat = "text" | "json" | "xml" | "markdown" | "csv" | "yaml";
type LogLevel =
	| "None"
	| "Critical"
	| "Error"
	| "Warning"
	| "Information"
	| "Debug"
	| "Trace";

type LogOutput = "console" | "file";

type ClogConfig = {
	level: LogLevel;
	format: LogFormat;
	formatter: LogFormatter;
	output: LogOutput;
};

type LogFormatter = (level: LogLevel, ...args: unknown[]) => string;

export type { ClogConfig, LogFormat, LogFormatter, LogLevel, LogOutput };
