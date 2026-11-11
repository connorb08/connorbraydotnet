import type { ComponentResourceOptions, Output } from "@pulumi/pulumi";
import { iam } from "@pulumi/aws";
import { getCallerIdentityOutput } from "@pulumi/aws";
import { ComponentResource, interpolate } from "@pulumi/pulumi";

export interface VaultBaseIAMArgs {
	rolePrefix: string;
	/** Set to false after running `vault write -f aws/config/rotate-root` to remove the bootstrap key from state */
	createBootstrapKey?: boolean;
}

export class VaultAwsSecretsEngine extends ComponentResource {
	readonly bootstrapAccessKeyId: Output<string> | undefined;
	readonly bootstrapSecretAccessKey: Output<string> | undefined;
	readonly userArn: Output<string>;
	readonly userName: Output<string>;
	readonly userPolicyId: Output<string>;

	constructor(name: string, args: VaultBaseIAMArgs, options?: ComponentResourceOptions) {
		super("connor-bray:infrastructure:aws:iam:VaultAwsSecretsEngine", name, {}, options);

		const accountId = getCallerIdentityOutput().accountId;
		const rolePrefix = args.rolePrefix ?? "vault";
		const createBootstrapKey = args.createBootstrapKey ?? true;

		const vaultUser = new iam.User(
			`${name}-user`,
			{
				name: "vault-aws-engine",
			},
			{ parent: this },
		);

		const vaultUserPolicy = new iam.UserPolicy(
			`${name}-policy`,
			{
				user: vaultUser.name,
				policy: {
					Version: "2012-10-17",
					Statement: [
						{
							Effect: "Allow",
							Action: "sts:AssumeRole",
							Resource: interpolate`arn:aws:iam::${accountId}:role/${rolePrefix}-*`,
						},
						{
							Effect: "Allow",
							Action: [
								"iam:CreateAccessKey",
								"iam:DeleteAccessKey",
								"iam:ListAccessKeys",
								"iam:GetUser",
							],
							Resource: vaultUser.arn,
						},
					],
				},
			},
			{ parent: this },
		);

		if (createBootstrapKey) {
			const bootstrapKey = new iam.AccessKey(
				`${name}-bootstrap-key`,
				{
					user: vaultUser.name,
				},
				{ parent: this },
			);
			this.bootstrapAccessKeyId = bootstrapKey.id;
			this.bootstrapSecretAccessKey = bootstrapKey.secret;
		}

		this.userArn = vaultUser.arn;
		this.userName = vaultUser.name;
		this.userPolicyId = vaultUserPolicy.id;

		this.registerOutputs({
			userArn: this.userArn,
			userName: this.userName,
			bootstrapAccessKeyId: this.bootstrapAccessKeyId,
			bootstrapSecretAccessKey: this.bootstrapSecretAccessKey,
			userPolicyId: this.userPolicyId,
		});
	}
}
