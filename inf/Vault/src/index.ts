import type { ComponentResourceOptions } from "@pulumi/pulumi";
import { VaultSecretsEngines } from "./secret-engines/index.ts";
import { ComponentResource } from "@pulumi/pulumi";

const name = "vault";

export class Vault extends ComponentResource {
	public readonly secretEngines: VaultSecretsEngines;

	constructor(options?: ComponentResourceOptions) {
		super("connor-bray:infrastructure:Vault", name, {}, options);
		this.secretEngines = new VaultSecretsEngines({ parent: this });
		this.registerOutputs({});
	}
}

const _ = new Vault();
