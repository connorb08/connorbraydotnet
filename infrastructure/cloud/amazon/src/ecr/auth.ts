import type { Cradle } from "../container";
import type { Output } from "@pulumi/pulumi";
import { iam } from "@pulumi/aws";
import { asFunction } from "awilix";

export interface IamResources {
	readRole: iam.Role;
	writeRole: iam.Role;
	repoPolicyJson: Output<iam.GetPolicyDocumentResult>;
}

export const iamResources = asFunction(
	({ ecrRoot: parent, vaultUser }: Cradle): IamResources => {
		const assumeRolePolicy: iam.PolicyDocument = {
			Version: "2012-10-17",
			Statement: [
				{
					Effect: "Allow",
					Principal: { AWS: vaultUser.arn },
					Action: "sts:AssumeRole",
				},
			],
		};

		const readRole = new iam.Role(
			"vault-ecr-devenv-read",
			{
				name: "vault-ecr-devenv-read",
				description: "Read-only access to devenv ECR repositories",
				assumeRolePolicy,
			},
			{ parent: parent },
		);

		const writeRole = new iam.Role(
			"vault-ecr-devenv-write",
			{
				name: "vault-ecr-devenv-write",
				description: "Write access to devenv ECR repositories",
				assumeRolePolicy,
			},
			{ parent: parent },
		);

		const authPolicyDoc: iam.PolicyDocument = {
			Version: "2012-10-17",
			Statement: [
				{
					Effect: "Allow",
					Action: "ecr:GetAuthorizationToken",
					Resource: "*",
				},
			],
		};

		const _readAuthPolicy = new iam.RolePolicy(
			"vault-ecr-devenv-read-auth",
			{
				role: readRole.id,
				policy: authPolicyDoc,
			},
			{ parent: readRole },
		);

		const _writeAuthPolicy = new iam.RolePolicy(
			"vault-ecr-devenv-write-auth",
			{
				role: writeRole.id,
				policy: authPolicyDoc,
			},
			{ parent: writeRole },
		);

		const repoPolicyJson = iam.getPolicyDocumentOutput({
			statements: [
				{
					sid: "AllowDevEnvRead",
					effect: "Allow",
					principals: [
						{
							type: "AWS",
							identifiers: [readRole.arn],
						},
					],
					actions: [
						"ecr:BatchCheckLayerAvailability",
						"ecr:BatchGetImage",
						"ecr:DescribeImages",
						"ecr:DescribeRepositories",
						"ecr:GetDownloadUrlForLayer",
						"ecr:ListImages",
					],
				},
				{
					sid: "AllowDevEnvWrite",
					effect: "Allow",
					principals: [
						{
							type: "AWS",
							identifiers: [writeRole.arn],
						},
					],
					actions: [
						"ecr:BatchCheckLayerAvailability",
						"ecr:BatchGetImage",
						"ecr:CompleteLayerUpload",
						"ecr:DescribeImages",
						"ecr:DescribeRepositories",
						"ecr:GetDownloadUrlForLayer",
						"ecr:InitiateLayerUpload",
						"ecr:ListImages",
						"ecr:PutImage",
						"ecr:UploadLayerPart",
					],
				},
			],
		});

		return { readRole, writeRole, repoPolicyJson };
	},
).singleton();
