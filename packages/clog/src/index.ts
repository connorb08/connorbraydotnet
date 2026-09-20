import { Logger } from "./logger";
import type { ClogConfig, ILogger } from "./types";

export const createLogger = (config?: Partial<ClogConfig> | undefined): ILogger =>
	new Logger(config ?? {});
