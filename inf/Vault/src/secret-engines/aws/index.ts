import type { ComponentResourceOptions, Output } from "@pulumi/pulumi";
import { ComponentResource } from "@pulumi/pulumi";
import { Mount } from "@pulumi/vault";

export class VaultAwsSecretsEngine extends ComponentResource {
	public readonly mount: Mount;
	public readonly mountPath: Output<string>;

	constructor(options?: ComponentResourceOptions) {
		super(
			"connor-bray:infrastructure:vault:secret-engines:Aws",
			"aws-engine",
			{},
			options,
		);
		this.mount = new Mount(
			"aws-engine",
			{
				path: "aws",
				type: "aws",
			},
			{ parent: this, protect: true },
		);
		this.mountPath = this.mount.path;
		this.registerOutputs({ mountPath: this.mountPath });
	}
}
