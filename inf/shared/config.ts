import type { Config, Output } from "@pulumi/pulumi";

export function requireCredential(
	config: Config,
	key: string,
	context: string,
): Output<string> {
	return config.requireSecret(key).apply((value) => {
		if (value.trim().length === 0) {
			throw new Error(`${context}: ${key} must not be empty.`);
		}
		return value;
	});
}
