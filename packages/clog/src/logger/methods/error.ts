import type { ILogger } from "#types";

const logError = (
	errorFunction: ILogger["error"],
	errorMessage: string,
	...args: unknown[]
): void => {
	const error = new Error(errorMessage);
	Error.captureStackTrace(error, errorFunction);
	console.error(error, ...args);
};

export default logError;
