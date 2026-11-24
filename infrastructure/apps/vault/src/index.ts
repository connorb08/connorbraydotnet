import type { ComponentResourceOptions } from "@pulumi/pulumi";
import { proxyAuth } from "./auth/approle";
import { VaultSecretsEngines } from "./secret-engines/index.js";
import { ComponentResource, secret } from "@pulumi/pulumi";

const name = "vault";

export class Vault extends ComponentResource {
	public readonly secretEngines: VaultSecretsEngines;
	public readonly proxyAuth: ReturnType<typeof proxyAuth>;

	constructor(options?: ComponentResourceOptions) {
		super("connor-bray:infrastructure:Vault", name, {}, options);
		this.secretEngines = new VaultSecretsEngines({ parent: this });
		this.proxyAuth = proxyAuth({ parent: this });
		this.registerOutputs({});
	}
}

const vault = new Vault();

export const vaultProxyRoleId = secret(vault.proxyAuth.role.roleId);
export const vaultProxyRoleName = vault.proxyAuth.role.roleName;
export const vaultProxyAuthPath = vault.proxyAuth.backend.path;
