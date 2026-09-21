import type { MockInstance } from "vitest";
import { Logger } from "#src/logger/index";

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: test
describe("Logger Levels", () => {
	let logger: Logger;
	let loggerOutput: MockInstance<(...args: unknown[]) => void>;

	beforeEach(() => {
		logger = new Logger({
			output: "console",
			formatter: (_level, ...args) => `${args.join(" ")}`,
		});
		loggerOutput = vi
			.spyOn(logger as unknown as { logConsole: Logger["logConsole"] }, "logConsole")
			.mockImplementation((...args) => args[0]);
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("Should log nothing when level is None", async () => {
		// Setup
		logger.level = "None";

		// Act
		logger.logCritical("Critical");
		logger.logError("Error");
		logger.logWarning("Warn");
		logger.logInformation("Info");
		logger.logDebug("Debug");
		logger.logTrace("Trace");

		// Assert
		expect(loggerOutput).not.toHaveBeenCalled();
	});

	it("Should log only critical messages when level is Critical", async () => {
		// Setup
		logger.level = "Critical";

		// Act
		logger.logCritical("Critical");
		logger.logError("Error");
		logger.logWarning("Warn");
		logger.logInformation("Info");
		logger.logDebug("Debug");
		logger.logTrace("Trace");

		// Assert
		expect(loggerOutput).toHaveBeenCalledTimes(1);
		expect(loggerOutput).toHaveNthReturnedWith(1, "Critical");
	});

	it("Should log critical and error messages when level is Error", async () => {
		// Setup
		logger.level = "Error";

		// Act
		logger.logCritical("Critical");
		logger.logError("Error");
		logger.logWarning("Warn");
		logger.logInformation("Info");
		logger.logDebug("Debug");
		logger.logTrace("Trace");

		// Assert
		expect(loggerOutput).toHaveBeenCalledTimes(2);
		expect(loggerOutput).toHaveNthReturnedWith(1, "Critical");
		expect(loggerOutput).toHaveNthReturnedWith(2, "Error");
	});

	it("Should log critical, error, and warning messages when level is Warning", async () => {
		// Setup
		logger.level = "Warning";

		// Act
		logger.logCritical("Critical");
		logger.logError("Error");
		logger.logWarning("Warn");
		logger.logInformation("Info");
		logger.logDebug("Debug");
		logger.logTrace("Trace");

		// Assert
		expect(loggerOutput).toHaveBeenCalledTimes(3);
		expect(loggerOutput).toHaveNthReturnedWith(1, "Critical");
		expect(loggerOutput).toHaveNthReturnedWith(2, "Error");
		expect(loggerOutput).toHaveNthReturnedWith(3, "Warn");
	});

	it("Should log critical, error, warning, and information messages when level is Information", async () => {
		// Setup
		logger.level = "Information";

		// Act
		logger.logCritical("Critical");
		logger.logError("Error");
		logger.logWarning("Warn");
		logger.logInformation("Info");
		logger.logDebug("Debug");
		logger.logTrace("Trace");

		// Assert
		expect(loggerOutput).toHaveBeenCalledTimes(4);
		expect(loggerOutput).toHaveNthReturnedWith(1, "Critical");
		expect(loggerOutput).toHaveNthReturnedWith(2, "Error");
		expect(loggerOutput).toHaveNthReturnedWith(3, "Warn");
		expect(loggerOutput).toHaveNthReturnedWith(4, "Info");
	});

	it("Should log critical, error, warning, information, and debug messages when level is Debug", async () => {
		// Setup
		logger.level = "Debug";

		// Act
		logger.logCritical("Critical");
		logger.logError("Error");
		logger.logWarning("Warn");
		logger.logInformation("Info");
		logger.logDebug("Debug");
		logger.logTrace("Trace");

		// Assert
		expect(loggerOutput).toHaveBeenCalledTimes(5);
		expect(loggerOutput).toHaveNthReturnedWith(1, "Critical");
		expect(loggerOutput).toHaveNthReturnedWith(2, "Error");
		expect(loggerOutput).toHaveNthReturnedWith(3, "Warn");
		expect(loggerOutput).toHaveNthReturnedWith(4, "Info");
		expect(loggerOutput).toHaveNthReturnedWith(5, "Debug");
	});

	it("Should log all messages when level is Trace", async () => {
		// Setup
		logger.level = "Trace";

		// Act
		logger.logCritical("Critical");
		logger.logError("Error");
		logger.logWarning("Warn");
		logger.logInformation("Info");
		logger.logDebug("Debug");
		logger.logTrace("Trace");

		// Assert
		expect(loggerOutput).toHaveBeenCalledTimes(6);
		expect(loggerOutput).toHaveNthReturnedWith(1, "Critical");
		expect(loggerOutput).toHaveNthReturnedWith(2, "Error");
		expect(loggerOutput).toHaveNthReturnedWith(3, "Warn");
		expect(loggerOutput).toHaveNthReturnedWith(4, "Info");
		expect(loggerOutput).toHaveNthReturnedWith(5, "Debug");
		expect(loggerOutput).toHaveNthReturnedWith(6, "Trace");
	});
});
