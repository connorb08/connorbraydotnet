import type { ComponentResourceOptions, Output } from "@pulumi/pulumi";
import { ComponentResource } from "@pulumi/pulumi";
import { Mount } from "@pulumi/vault";

export class VaultKvSecretsEngine extends ComponentResource {
	public readonly mount: Mount;
	public readonly mountPath: Output<string>;

	constructor(options?: ComponentResourceOptions) {
		super("connor-bray:infrastructure:vault:secret-engines:Kv", "kv-engine", {}, options);
		this.mount = new Mount(
			"kv-engine",
			{
				path: "secret",
				type: "kv",
				options: { version: "2" },
			},
			{ parent: this, protect: true },
		);
		this.mountPath = this.mount.path;
		this.registerOutputs({ mountPath: this.mountPath });
	}
}
