import type { LogLevel } from "#types";
import { Runtime, RuntimeEnvironment } from "./runtime";

enum ClogEnv {
	LogLevel = "CLOG_LOG_LEVEL",
	Runtime = "CLOG_RUNTIME",
}

interface EnvironmentVariables {
	[ClogEnv.LogLevel]?: string | undefined;
	[ClogEnv.Runtime]?: string | undefined;
}

const EnvironmentVars: EnvironmentVariables = {
	[ClogEnv.LogLevel]: undefined,
	[ClogEnv.Runtime]: undefined,
};

EnvironmentVars[ClogEnv.LogLevel] ??= process.env.CLOG_LOG_LEVEL;
EnvironmentVars[ClogEnv.Runtime] ??= process.env.CLOG_RUNTIME;

EnvironmentVars[ClogEnv.LogLevel] ??= import.meta.env.CLOG_LOG_LEVEL;
EnvironmentVars[ClogEnv.Runtime] ??= import.meta.env.CLOG_RUNTIME;

if (Runtime === RuntimeEnvironment.Deno) {
	// @ts-expect-error Deno global is not defined in all environments
	EnvironmentVars[ClogEnv.LogLevel] ??= Deno.env.get("CLOG_LOG_LEVEL");
	// @ts-expect-error Deno global is not defined in all environments
	EnvironmentVars[ClogEnv.Runtime] ??= Deno.env.get("CLOG_RUNTIME");
}

if (Runtime === RuntimeEnvironment.CloudflareWorkers) {
	// @ts-expect-error globalThis does not have CLOG_LOG_LEVEL in all environments
	EnvironmentVars[ClogEnv.LogLevel] ??= globalThis.CLOG_LOG_LEVEL;
	// @ts-expect-error globalThis does not have CLOG_RUNTIME in all environments
	EnvironmentVars[ClogEnv.Runtime] ??= globalThis.CLOG_RUNTIME;
}

if (Runtime === RuntimeEnvironment.Browser) {
	// @ts-expect-error window global is not defined in all environments
	EnvironmentVars[ClogEnv.LogLevel] ??= window?.CLOG_LOG_LEVEL;
	// @ts-expect-error window global is not defined in all environments
	EnvironmentVars[ClogEnv.Runtime] ??= window?.CLOG_RUNTIME;
}

EnvironmentVars[ClogEnv.LogLevel] = EnvironmentVars[ClogEnv.LogLevel]
	?.trim()
	?.toLowerCase() as LogLevel | undefined;
EnvironmentVars[ClogEnv.Runtime] = EnvironmentVars[ClogEnv.Runtime]
	?.trim()
	?.toLowerCase() as LogLevel | undefined;

export { EnvironmentVars, ClogEnv };
export type { EnvironmentVariables };
