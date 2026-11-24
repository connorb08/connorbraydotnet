import type { Cradle } from "../container";
import { iam } from "@pulumi/aws";
import { asFunction } from "awilix";

export const adminRole = asFunction(({ iam: { root }, vaultUser }: Cradle): iam.Role => {
	const role = new iam.Role(
		"vault-admin",
		{
			name: "vault-admin",
			description: "Personal administrator credentials issued by Vault",
			assumeRolePolicy: {
				Version: "2012-10-17",
				Statement: [
					{
						Effect: "Allow",
						Principal: { AWS: vaultUser.arn },
						Action: "sts:AssumeRole",
					},
				],
			},
		},
		{ parent: root },
	);

	new iam.RolePolicyAttachment(
		"vault-admin-access",
		{ role: role.name, policyArn: iam.ManagedPolicy.AdministratorAccess },
		{ parent: role },
	);

	return role;
}).singleton();
