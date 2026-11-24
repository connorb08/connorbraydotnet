import type { ComponentResourceOptions } from "@pulumi/pulumi";
import { awsEngine } from "./aws/index";
import { VaultKvSecretsEngine } from "./kv/index";
import { ComponentResource } from "@pulumi/pulumi";

export class VaultSecretsEngines extends ComponentResource {
	public readonly kv: VaultKvSecretsEngine;
	public readonly aws: ReturnType<typeof awsEngine>;

	constructor(options?: ComponentResourceOptions) {
		super(
			"connor-bray:infrastructure:vault:SecretsEngines",
			"secret-engines",
			{},
			options,
		);

		this.kv = new VaultKvSecretsEngine({ parent: this });
		this.aws = awsEngine({ parent: this });

		this.registerOutputs({
			kvMountPath: this.kv.mountPath,
			awsMountPath: this.aws.mountPath,
		});
	}
}
