import type { ResourceTransformationArgs } from "@pulumi/pulumi";
import { requireRecord } from "../shared/transforms";
import { resolveOutput } from "./mock-runtime";
import { isSecret, runtime } from "@pulumi/pulumi";
import { expect, test } from "bun:test";

test("configures KV and AWS mounts and roles using secret AWS stack outputs", async () => {
	const resources: { type: string; inputs: Record<string, unknown> }[] = [];
	const registrations: ResourceTransformationArgs[] = [];
	await runtime.setMocks(
		{
			newResource: (args) => {
				const inputs = requireRecord(args.inputs, "Mock inputs must be a mapping.");
				resources.push({ type: args.type, inputs });
				if (args.type === "pulumi:pulumi:StackReference") {
					return {
						id: args.name,
						state: {
							...inputs,
							outputs: {
								vaultAwsAccessKeyId: "test-aws-access-key",
								vaultAwsSecretAccessKey: "test-aws-secret-key",
								awsRegion: "us-east-2",
								ecrReadRoleArn: "arn:aws:iam::123456789012:role/vault-ecr-devenv-read",
								ecrWriteRoleArn: "arn:aws:iam::123456789012:role/vault-ecr-devenv-write",
								awsAdminRoleArn: "arn:aws:iam::123456789012:role/vault-admin",
							},
							secretOutputNames: ["vaultAwsSecretAccessKey"],
						},
					};
				}
				const state = { ...inputs };
				if (args.type === "vault:appRole/authBackendRole:AuthBackendRole") {
					state.roleId = "test-proxy-role-id";
				}
				return { id: args.name, state };
			},
			call: (args) => args.inputs,
		},
		"Vault",
		"test",
		false,
	);
	runtime.setAllConfig({});
	let configuration: typeof import("../apps/vault/src/index") | undefined;
	await runtime.runInPulumiStack(async () => {
		runtime.registerStackTransformation((args) => {
			registrations.push(args);
		});
		configuration = await import("../apps/vault/src/index");
		return {};
	});
	await runtime.disconnect();

	if (!configuration) {
		throw new Error("Vault module failed to load.");
	}
	const component = registrations.find(
		(args) => args.type === "connor-bray:infrastructure:Vault",
	);
	if (!component || !(component.resource instanceof configuration.Vault)) {
		throw new Error("Missing Vault component registration.");
	}
	expect(await resolveOutput(component.resource.secretEngines.kv.mountPath)).toBe(
		"secret",
	);
	expect(await resolveOutput(component.resource.secretEngines.aws.mountPath)).toBe("aws");
	const mounts = resources.filter(
		(resource) => resource.type === "vault:index/mount:Mount",
	);
	expect(mounts).toHaveLength(2);
	expect(mounts).toEqual(
		expect.arrayContaining([
			{
				type: "vault:index/mount:Mount",
				inputs: {
					path: "secret",
					type: "kv",
					options: { version: "2" },
				},
			},
			{
				type: "vault:index/mount:Mount",
				inputs: {
					path: "aws",
					type: "aws",
					defaultLeaseTtlSeconds: 3600,
					maxLeaseTtlSeconds: 14400,
				},
			},
		]),
	);
	const secretEngines = registrations.find(
		(args) => args.type === "connor-bray:infrastructure:vault:SecretsEngines",
	);
	if (!secretEngines) {
		throw new Error("Missing secrets engines collection.");
	}
	expect(secretEngines.opts.parent).toBe(component.resource);
	for (const [name, type] of [
		["kv-engine", "connor-bray:infrastructure:vault:secret-engines:Kv"],
		["aws-engine", "connor-bray:infrastructure/vault/secret-engines:Aws"],
	]) {
		const engine = registrations.find((args) => args.type === type);
		if (!engine) {
			throw new Error(`Missing secrets engine component: ${type}`);
		}
		const mount = registrations.find(
			(args) => args.type === "vault:index/mount:Mount" && args.name === name,
		);
		if (!mount) {
			throw new Error(`Missing secrets engine registration: ${name}`);
		}
		expect(engine.opts.parent).toBe(secretEngines.resource);
		expect(mount.opts.parent).toBe(engine.resource);
		if (name === "kv-engine") {
			expect(mount.opts.protect).toBe(true);
		}
	}

	const awsEngine = component.resource.secretEngines.aws;
	expect(await isSecret(awsEngine.awsBackend.dataJson)).toBe(true);
	expect(JSON.parse(await resolveOutput(awsEngine.awsBackend.dataJson))).toEqual({
		access_key: "test-aws-access-key",
		secret_key: "test-aws-secret-key",
		region: "us-east-2",
	});
	expect(await resolveOutput(awsEngine.awsBackend.path)).toBe("aws/config/root");
	expect(await resolveOutput(awsEngine.awsBackend.ignoreAbsentFields)).toBe(true);
	expect(await resolveOutput(awsEngine.awsBackend.disableDelete)).toBe(true);
	const backend = registrations.find((args) => args.resource === awsEngine.awsBackend);
	expect(backend?.opts.parent).toBe(
		registrations.find(
			(args) => args.type === "connor-bray:infrastructure/vault/secret-engines:Aws",
		)?.resource,
	);
	for (const role of [awsEngine.readRole, awsEngine.writeRole, awsEngine.adminRole]) {
		const registration = registrations.find((args) => args.resource === role);
		expect(registration?.opts.parent).toBe(backend?.opts.parent);
		expect(registration?.opts.dependsOn).toEqual([awsEngine.awsBackend]);
	}
	const roles = resources.filter(
		(resource) => resource.type === "vault:aws/secretBackendRole:SecretBackendRole",
	);
	expect(roles.map((role) => role.inputs)).toEqual([
		{
			backend: "aws",
			name: "ecr-devenv-read",
			credentialType: "assumed_role",
			roleArns: ["arn:aws:iam::123456789012:role/vault-ecr-devenv-read"],
			defaultStsTtl: 3600,
			maxStsTtl: 3600,
		},
		{
			backend: "aws",
			name: "ecr-devenv-write",
			credentialType: "assumed_role",
			roleArns: ["arn:aws:iam::123456789012:role/vault-ecr-devenv-write"],
			defaultStsTtl: 3600,
			maxStsTtl: 3600,
		},
		{
			backend: "aws",
			name: "admin",
			credentialType: "assumed_role",
			roleArns: ["arn:aws:iam::123456789012:role/vault-admin"],
			defaultStsTtl: 3600,
			maxStsTtl: 3600,
		},
	]);
	const proxyAuth = component.resource.proxyAuth;
	expect(await resolveOutput(proxyAuth.backend.path)).toBe("approle");
	expect(
		registrations.find((args) => args.resource === proxyAuth.backend)?.opts.protect,
	).toBe(true);
	expect(
		registrations.find((args) => args.resource === proxyAuth.root)?.opts.parent,
	).toBe(component.resource);
	expect(await resolveOutput(proxyAuth.role.tokenPolicies)).toEqual([
		"devcontainer-admin",
	]);
	expect(await resolveOutput(proxyAuth.role.bindSecretId)).toBe(true);
	expect(await resolveOutput(proxyAuth.role.secretIdTtl)).toBe(86400);
	expect(await resolveOutput(proxyAuth.role.tokenPeriod)).toBe(3600);
	expect(await resolveOutput(proxyAuth.policy.policy)).toContain('path "*"');
	expect(await isSecret(configuration.vaultProxyRoleId)).toBe(true);
	expect(await resolveOutput(configuration.vaultProxyRoleId)).toBe("test-proxy-role-id");
	expect(await resolveOutput(configuration.vaultProxyRoleName)).toBe(
		"devcontainer-admin",
	);
	expect(await resolveOutput(configuration.vaultProxyAuthPath)).toBe("approle");
	expect(
		resources.find((resource) => resource.type === "pulumi:pulumi:StackReference")?.inputs
			.name,
	).toBe("organization/aws/dev");
	expect(resources.some((resource) => resource.type.startsWith("aws:"))).toBe(false);
	expect(
		resources.some(
			(resource) => resource.type === "vault:aws/secretBackend:SecretBackend",
		),
	).toBe(false);
});
