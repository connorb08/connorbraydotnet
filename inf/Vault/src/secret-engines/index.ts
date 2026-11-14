import type { ComponentResourceOptions } from "@pulumi/pulumi";
import { VaultAwsSecretsEngine } from "./aws/index.ts";
import { VaultKvSecretsEngine } from "./kv/index.ts";
import { ComponentResource } from "@pulumi/pulumi";

export class VaultSecretsEngines extends ComponentResource {
	public readonly kv: VaultKvSecretsEngine;
	public readonly aws: VaultAwsSecretsEngine;

	constructor(options?: ComponentResourceOptions) {
		super(
			"connor-bray:infrastructure:vault:SecretsEngines",
			"secret-engines",
			{},
			options,
		);

		this.kv = new VaultKvSecretsEngine({ parent: this });
		this.aws = new VaultAwsSecretsEngine({ parent: this });

		this.registerOutputs({
			kvMountPath: this.kv.mountPath,
			awsMountPath: this.aws.mountPath,
		});
	}
}
