import type { PostgresqlApplicationConfig } from "./types";
import type { ComponentResourceOptions, Input, Output } from "@pulumi/pulumi";
import { core } from "@pulumi/kubernetes";
import { secret } from "@pulumi/pulumi";
import { RandomPassword } from "@pulumi/random";

export interface PostgresqlCredentials {
	name: string;
	password: Output<string>;
	secret: core.v1.Secret;
}

export function createDatabaseCredentials(
	name: string,
	namespace: Input<string>,
	config: PostgresqlApplicationConfig,
	options: ComponentResourceOptions,
): PostgresqlCredentials {
	const password = secret(
		config.password ??
			new RandomPassword(
				`postgresql-${name}-password`,
				{ length: 32, special: false },
				options,
			).result,
	).apply((value) => {
		if (value.trim().length === 0) {
			throw new Error(`PostgreSQL: password for ${name} must not be empty.`);
		}
		return value;
	});
	const credentials = new core.v1.Secret(
		`postgresql-${name}`,
		{
			metadata: { name: `postgresql-${name}`, namespace },
			type: "kubernetes.io/basic-auth",
			stringData: { username: name, password },
		},
		{ ...options, additionalSecretOutputs: ["data", "stringData"] },
	);
	return { name, password, secret: credentials };
}
