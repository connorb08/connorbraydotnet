interface EnvironmentVariables {
	CLOG_LOG_LEVEL?: string | undefined;
	CLOG_RUNTIME?: string | undefined;
}

const _validateEnvironmentVariables = (_env: EnvironmentVariables): void => {};

const EnvironmentVars: EnvironmentVariables = {
	CLOG_LOG_LEVEL: undefined,
	CLOG_RUNTIME: undefined,
};

//
EnvironmentVars.CLOG_LOG_LEVEL ??= process.env.CLOG_LOG_LEVEL;
EnvironmentVars.CLOG_RUNTIME ??= process.env.CLOG_RUNTIME;

EnvironmentVars.CLOG_LOG_LEVEL ??= import.meta.env.CLOG_LOG_LEVEL;
EnvironmentVars.CLOG_RUNTIME ??= import.meta.env.CLOG_RUNTIME;

EnvironmentVars.CLOG_LOG_LEVEL ??= Deno?.env.get("CLOG_LOG_LEVEL");
EnvironmentVars.CLOG_RUNTIME ??= Deno?.env.get("CLOG_RUNTIME");

EnvironmentVars.CLOG_LOG_LEVEL ??= globalThis.CLOG_LOG_LEVEL;
EnvironmentVars.CLOG_RUNTIME ??= globalThis.CLOG_RUNTIME;

EnvironmentVars.CLOG_LOG_LEVEL ??= window?.CLOG_LOG_LEVEL;
EnvironmentVars.CLOG_RUNTIME ??= window?.CLOG_RUNTIME;

export type { EnvironmentVariables };
