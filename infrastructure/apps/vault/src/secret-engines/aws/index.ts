import type { ComponentResourceOptions } from "@pulumi/pulumi";
import { ComponentResource, interpolate, jsonStringify, secret } from "@pulumi/pulumi";
import { aws, generic, Mount } from "@pulumi/vault";
import { StackRef } from "@root/inf/stack-ref";

export const awsEngine = (options?: ComponentResourceOptions) => {
	const awsStack = StackRef("aws");
	const root = new ComponentResource(
		"connor-bray:infrastructure/vault/secret-engines:Aws",
		"aws-engine",
		{},
		options,
	);
	const mount = new Mount(
		"aws-engine",
		{
			path: "aws",
			type: "aws",
			defaultLeaseTtlSeconds: 3600,
			maxLeaseTtlSeconds: 14400,
		},
		{ parent: root, protect: true },
	);

	// SecretBackend also owns the mount; configure the existing mount instead.
	const awsBackend = new generic.Endpoint(
		"aws-root-config",
		{
			path: interpolate`${mount.path}/config/root`,
			dataJson: jsonStringify({
				access_key: awsStack.requireOutput("vaultAwsAccessKeyId"),
				secret_key: secret(awsStack.requireOutput("vaultAwsSecretAccessKey")),
				region: awsStack.requireOutput("awsRegion"),
			}),
			ignoreAbsentFields: true,
			disableDelete: true,
		},
		{ parent: root },
	);

	const readRole = new aws.SecretBackendRole(
		"ecr-devenv-read",
		{
			backend: mount.path,
			name: "ecr-devenv-read",
			credentialType: "assumed_role",
			roleArns: [awsStack.requireOutput("ecrReadRoleArn")],
			defaultStsTtl: 3600,
			maxStsTtl: 3600,
		},
		{ parent: root, dependsOn: [awsBackend] },
	);
	const writeRole = new aws.SecretBackendRole(
		"ecr-devenv-write",
		{
			backend: mount.path,
			name: "ecr-devenv-write",
			credentialType: "assumed_role",
			roleArns: [awsStack.requireOutput("ecrWriteRoleArn")],
			defaultStsTtl: 3600,
			maxStsTtl: 3600,
		},
		{ parent: root, dependsOn: [awsBackend] },
	);

	const adminRole = new aws.SecretBackendRole(
		"admin",
		{
			backend: mount.path,
			name: "admin",
			credentialType: "assumed_role",
			roleArns: [awsStack.requireOutput("awsAdminRoleArn")],
			defaultStsTtl: 3600,
			maxStsTtl: 3600,
		},
		{ parent: root, dependsOn: [awsBackend] },
	);

	return { mount, mountPath: mount.path, awsBackend, readRole, writeRole, adminRole };
};
