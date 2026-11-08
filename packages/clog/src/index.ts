import type { ClogConfig, ILogger } from "./types";
import { Logger } from "./logger";

export const createLogger = (config?: Partial<ClogConfig> | undefined): ILogger =>
	new Logger(config ?? {});
