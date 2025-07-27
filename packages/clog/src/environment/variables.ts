import type { LogLevel } from "#types";
import { Runtime, RuntimeEnvironment } from "./runtime";

const ClogEnv = {
	LogLevel: "CLOG_LEVEL",
	Runtime: "CLOG_RUNTIME",
} as const;

interface EnvironmentVariables {
	[ClogEnv.LogLevel]?: string | undefined;
	[ClogEnv.Runtime]?: string | undefined;
}

const EnvironmentVars: EnvironmentVariables = {
	[ClogEnv.LogLevel]: undefined,
	[ClogEnv.Runtime]: undefined,
};

EnvironmentVars[ClogEnv.LogLevel] ??= process.env[ClogEnv.LogLevel];
EnvironmentVars[ClogEnv.Runtime] ??= process.env[ClogEnv.Runtime];

// EnvironmentVars[ClogEnv.LogLevel] ??= import.meta.env[ClogEnv.LogLevel];
// EnvironmentVars[ClogEnv.Runtime] ??= import.meta.env[ClogEnv.Runtime];

// if (Runtime === RuntimeEnvironment.Deno) {
// 	// @ts-expect-error Deno global is not defined in all environments
// 	EnvironmentVars[ClogEnv.LogLevel] ??= Deno.env.get(ClogEnv.LogLevel);
// 	// @ts-expect-error Deno global is not defined in all environments
// 	EnvironmentVars[ClogEnv.Runtime] ??= Deno.env.get(ClogEnv.Runtime);
// }

if (Runtime === RuntimeEnvironment.CloudflareWorkers) {
	// @ts-expect-error globalThis does not have CLOG_LOG_LEVEL in all environments
	EnvironmentVars[ClogEnv.LogLevel] ??= globalThis[ClogEnv.LogLevel];
	// @ts-expect-error globalThis does not have CLOG_RUNTIME in all environments
	EnvironmentVars[ClogEnv.Runtime] ??= globalThis[ClogEnv.Runtime];
}

if (Runtime === RuntimeEnvironment.Browser) {
	// @ts-expect-error window global is not defined in all environments
	EnvironmentVars[ClogEnv.LogLevel] ??= window?.[ClogEnv.LogLevel];
	// @ts-expect-error window global is not defined in all environments
	EnvironmentVars[ClogEnv.Runtime] ??= window?.[ClogEnv.Runtime];
}

EnvironmentVars[ClogEnv.LogLevel] = EnvironmentVars[ClogEnv.LogLevel]
	?.trim()
	?.toLowerCase() as LogLevel | undefined;
EnvironmentVars[ClogEnv.Runtime] = EnvironmentVars[ClogEnv.Runtime]
	?.trim()
	?.toLowerCase() as LogLevel | undefined;

export { EnvironmentVars, ClogEnv };
export type { EnvironmentVariables };
