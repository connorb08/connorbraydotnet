import type { ComponentResourceOptions, Output, Input } from "@pulumi/pulumi";
import { iam } from "@pulumi/aws";
import { ComponentResource } from "@pulumi/pulumi";

export interface VaultPulumiIAMArgs {
	vaultUserArn: Input<string>;
	rolePrefix: string;
	policyArn?: Input<string>;
}

export class VaultPulumiIAM extends ComponentResource {
	public readonly roleArn: Output<string>;
	public readonly roleName: Output<string>;

	constructor(
		name: string,
		args: VaultPulumiIAMArgs,
		options?: ComponentResourceOptions,
	) {
		super("connor-bray:infrastructure:aws:iam:VaultPulumiIAM", name, {}, options);

		const rolePrefix = args.rolePrefix;
		const vaultUserArn = args.vaultUserArn;
		const policyArn = "arn:aws:iam::aws:policy/AdministratorAccess";

		const pulumiDeployRole = new iam.Role(
			`${name}-role`,
			{
				name: `${rolePrefix}-pulumi-deploy`,
				description: "Elevated role assumed via Vault for Pulumi deployments",
				assumeRolePolicy: {
					Version: "2012-10-17",
					Statement: [
						{
							Effect: "Allow",
							Principal: { AWS: vaultUserArn },
							Action: "sts:AssumeRole",
						},
					],
				},
			},
			{ parent: this },
		);

		const _ = new iam.RolePolicyAttachment(
			"vault-pulumi-deploy-attachment",
			{
				role: pulumiDeployRole.name,
				policyArn: policyArn,
			},
			{ parent: this },
		);
		this.roleArn = pulumiDeployRole.arn;
		this.roleName = pulumiDeployRole.name;

		this.registerOutputs({
			roleArn: this.roleArn,
			roleName: this.roleName,
		});
	}
}
