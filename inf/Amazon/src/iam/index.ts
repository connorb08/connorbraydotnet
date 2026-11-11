import type { ComponentResourceOptions, Output } from "@pulumi/pulumi";
import { AdminRole } from "./admin.ts";
import { VaultPulumiIAM } from "./pulumi.ts";
import { VaultAwsSecretsEngine } from "./vault.ts";
import { ComponentResource } from "@pulumi/pulumi";

export interface IAMArgs {
	bootstrapVault: boolean;
}

export class AwsIam extends ComponentResource {
	readonly bootstrapAccessKeyId: Output<string> | undefined;
	readonly bootstrapSecretAccessKey: Output<string> | undefined;
	readonly pulumiDeployRoleArn: Output<string>;
	readonly adminRoleArn: Output<string>;
	readonly vaultUserArn: Output<string>;

	constructor(name: string, args: IAMArgs, options?: ComponentResourceOptions) {
		super("connor-bray:infrastructure:aws:iam:AwsIam", name, {}, options);

		const rolePrefix = "vault";
		const bootstrapVault = args.bootstrapVault;

		const vaultBase = new VaultAwsSecretsEngine("vault-base", {
			rolePrefix,
			createBootstrapKey: bootstrapVault,
		});

		const vaultPulumi = new VaultPulumiIAM("vault-pulumi", {
			vaultUserArn: vaultBase.userArn,
			rolePrefix,
		});

		const adminRole = new AdminRole("base", {
			vaultUserArn: vaultBase.userArn,
			rolePrefix,
		});

		this.bootstrapAccessKeyId = vaultBase.bootstrapAccessKeyId;
		this.bootstrapSecretAccessKey = vaultBase.bootstrapSecretAccessKey;
		this.vaultUserArn = vaultBase.userArn;
		this.pulumiDeployRoleArn = vaultPulumi.roleArn;
		this.adminRoleArn = adminRole.roleArn;

		this.registerOutputs({
			bootstrapAccessKeyId: this.bootstrapAccessKeyId,
			bootstrapSecretAccessKey: this.bootstrapSecretAccessKey,
			pulumiDeployRoleArn: this.pulumiDeployRoleArn,
			vaultUserArn: this.vaultUserArn,
			adminRoleArn: this.adminRoleArn,
		});
	}
}
