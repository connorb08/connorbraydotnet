import { awsConfig } from "../config";
import { iam } from "@pulumi/aws";
import { ComponentResource } from "@pulumi/pulumi";

export const vaultIam = (root: ComponentResource) => {
	const parent = new ComponentResource(
		"connor-bray:infrastructure/aws/iam:Vault",
		"vault-iam",
		{},
		{ parent: root },
	);

	const user = new iam.User(
		"vault-aws-secrets-engine",
		{
			name: "vault-aws-secrets-engine",
			path: "/vault/",
		},
		{ parent },
	);

	const accessKey = new iam.AccessKey(
		"vault-aws-access-key",
		{
			user: user.name,
		},
		{ parent: user },
	);

	const policy = new iam.UserPolicy(
		"vault-assume-vault-roles",
		{
			user: user.name,
			policy: {
				Version: "2012-10-17",
				Statement: [
					{
						Effect: "Allow",
						Action: "sts:AssumeRole",
						Resource: awsConfig.account.accountId.apply(
							(accountId) => `arn:aws:iam::${accountId}:role/vault-*`,
						),
					},
				],
			},
		},
		{ parent: user },
	);

	return { user, accessKey, policy };
};
