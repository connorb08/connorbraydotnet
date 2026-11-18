import { iam, kms } from "@pulumi/aws";

export const stateSecretsKey = new kms.Key(
	"state-secrets-key",
	{
		description: "Encrypt Pulumi configuration and state secrets.",
		customerMasterKeySpec: "SYMMETRIC_DEFAULT",
		keyUsage: "ENCRYPT_DECRYPT",
		enableKeyRotation: true,
		rotationPeriodInDays: 365,
		deletionWindowInDays: 30,
	},
	{ protect: true },
);

export const stateSecretsAccessPolicy = new iam.Policy("state-secrets-access", {
	description: "Encrypt and decrypt Pulumi secrets with the backend KMS key.",
	policy: stateSecretsKey.arn.apply((arn) =>
		JSON.stringify({
			Version: "2012-10-17",
			Statement: [
				{
					Sid: "UsePulumiSecretsKey",
					Effect: "Allow",
					Action: ["kms:Encrypt", "kms:Decrypt"],
					Resource: arn,
				},
			],
		}),
	),
});
