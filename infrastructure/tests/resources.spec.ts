import type { ResourceTransformArgs } from "@pulumi/pulumi";
import { parseSshPort } from "../cloud/amazon/src/vps/server";
import { normalizeDownwardApi } from "../shared/transforms";
import { loadPrograms, registrations, resolveOutput, resources } from "./mock-runtime";
import { isSecret } from "@pulumi/pulumi";
import { beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

let programs: Awaited<ReturnType<typeof loadPrograms>>;
beforeAll(async () => {
	programs = await loadPrograms();
});

describe("Infrastructure safeguards", () => {
	test("marks the SSH private key as secret", async () => {
		expect(await isSecret(programs.amazon.vpsPrivateKey)).toBe(true);
	});

	test("configures component parents and replacement/protection/dependency options", async () => {
		const named = await Promise.all(
			registrations.map(async (args) => ({
				args,
				urn: await resolveOutput(args.resource.urn),
			})),
		);
		const registration = (name: string, type?: string) => {
			const value = named.find(
				(entry) =>
					entry.urn.split("::").at(-1) === name &&
					(type === undefined || entry.urn.split("::").at(2)?.endsWith(type)),
			);
			if (value === undefined) {
				throw new Error(`Missing registration: ${name} (${type})`);
			}
			return value.args;
		};
		const server = registration("vps-main", "connor-bray:infrastructure:aws:vps:Server");
		const instance = registration("vps-main", "aws:lightsail/instance:Instance");
		expect(instance.opts.parent).toBe(server.resource);
		if (!("deleteBeforeReplace" in instance.opts)) {
			throw new Error("Missing deleteBeforeReplace option.");
		}
		expect(instance.opts.deleteBeforeReplace).toBe(true);
		expect(instance.opts.replaceOnChanges).toEqual(["userData"]);
		expect(registration("vps-main-keys").opts.parent).toBe(server.resource);
		expect(registration("state-bucket").opts.protect).toBe(true);
		expect(registration("state-secrets-key", "aws:kms/key:Key").opts.protect).toBe(true);
	});
});

test("creates a rotating KMS key and exports a region-qualified secrets provider URL", async () => {
	const key = resources.find(
		(resource) =>
			resource.type === "aws:kms/key:Key" && resource.name === "state-secrets-key",
	);
	expect(key?.inputs).toMatchObject({
		customerMasterKeySpec: "SYMMETRIC_DEFAULT",
		keyUsage: "ENCRYPT_DECRYPT",
		enableKeyRotation: true,
		rotationPeriodInDays: 365,
		deletionWindowInDays: 30,
	});
	const [keyId, keyArn, providerUrl, policyArn] = await Promise.all([
		resolveOutput(programs.backend.stateSecretsKeyId),
		resolveOutput(programs.backend.stateSecretsKeyArn),
		resolveOutput(programs.backend.stateSecretsProviderUrl),
		resolveOutput(programs.backend.stateSecretsPolicyArn),
	]);
	expect(keyId).toBe("12345678-1234-1234-1234-123456789012");
	expect(keyArn).toBe(
		"arn:aws:kms:us-east-2:123456789012:key/12345678-1234-1234-1234-123456789012",
	);
	expect(providerUrl).toBe(
		"awskms://12345678-1234-1234-1234-123456789012?region=us-east-2",
	);
	expect(policyArn).toBe("arn:aws:iam::123456789012:policy/test");
	const accessPolicy = resources.find(
		(resource) =>
			resource.type === "aws:iam/policy:Policy" &&
			resource.name === "state-secrets-access",
	);
	const policy = accessPolicy?.inputs.policy;
	if (typeof policy !== "string") {
		throw new Error("Missing serialized KMS access policy.");
	}
	expect(JSON.parse(policy)).toEqual({
		Version: "2012-10-17",
		Statement: [
			{
				Sid: "UsePulumiSecretsKey",
				Effect: "Allow",
				Action: ["kms:Encrypt", "kms:Decrypt"],
				Resource: keyArn,
			},
		],
	});
});

test("loads the bootstrap script and substitutes only the SSH port", () => {
	const instance = resources.find(
		(resource) => resource.type === "aws:lightsail/instance:Instance",
	);
	const original = readFileSync(
		new URL("../cloud/amazon/src/vps/init.sh", import.meta.url),
		"utf8",
	);
	expect(instance?.inputs.userData).toBe(original.replaceAll("__SSH_PORT__", "23456"));
});

test.each([1024, 65535, 23456])("accepts valid SSH port %s", (port) => {
	expect(parseSshPort(String(port))).toBe(port);
});

test.each([
	undefined,
	"",
	"1023",
	"65536",
	"22",
	"23456\n",
	" 23456",
	"+23456",
	"2e4",
	"123.5",
])("rejects invalid SSH port %s", (port) => {
	expect(() => parseSshPort(port)).toThrow(
		"VPS_SSH_PORT must be an integer between 1024 and 65535.",
	);
});

describe("Helm resource transforms", () => {
	// oxlint-disable max-lines-per-function -- Test function is long but necessary for coverage.
	test("normalizes downward API defaults without mutating inputs or explicit versions", () => {
		const args: ResourceTransformArgs = {
			type: "kubernetes:apps/v1:Deployment",
			name: "operator",
			custom: true,
			opts: {},
			props: {
				spec: {
					template: {
						spec: {
							containers: [
								{
									name: "operator",
									env: [
										{
											name: "POD_NAME",
											valueFrom: { fieldRef: { fieldPath: "metadata.name" } },
										},
										{
											name: "POD_UID",
											valueFrom: {
												fieldRef: {
													fieldPath: "metadata.uid",
													apiVersion: "v1",
												},
											},
										},
										{ name: "NORMAL", value: "preserved" },
									],
								},
							],
						},
					},
				},
			},
		};
		const original = structuredClone(args.props);
		const result = normalizeDownwardApi(args);
		expect(
			result?.props.spec.template.spec.containers[0].env[0].valueFrom.fieldRef,
		).toEqual({
			fieldPath: "metadata.name",
			apiVersion: "v1",
		});
		expect(result?.props.spec.template.spec.containers[0].env[1]).toEqual(
			args.props.spec.template.spec.containers[0].env[1],
		);
		expect(args.props).toEqual(original);
		expect(result?.opts).toBe(args.opts);
		expect(
			normalizeDownwardApi({ ...args, type: "kubernetes:core/v1:Service" }),
		).toBeUndefined();
		expect(() => normalizeDownwardApi({ ...args, props: {} })).toThrow();
	});
});
