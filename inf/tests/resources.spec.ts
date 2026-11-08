import type { ResourceTransformArgs } from "@pulumi/pulumi";
import { parseSshPort } from "../Amazon/src/vps/server.ts";
import { normalizeDownwardApi } from "../Kubernetes/src/tailscale.ts";
import { addTlsChecksum } from "../Kubernetes/src/vault.ts";
import { loadPrograms, registrations, resolveOutput, resources } from "./mock-runtime.ts";
import { isSecret, output } from "@pulumi/pulumi";
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
		expect(registration("vault-ingress").opts.dependsOn).toEqual([
			registration("vault", "kubernetes:helm.sh/v4:Chart").resource,
			registration("tailscale-operator").resource,
		]);
		for (const name of ["vault-internal-tls", "tailscale-operator-oauth"]) {
			const options = registration(name).opts;
			if (!("additionalSecretOutputs" in options)) {
				throw new Error(`Missing secret outputs for ${name}.`);
			}
			expect(options.additionalSecretOutputs).toEqual(
				expect.arrayContaining(["data", "stringData"]),
			);
		}
		expect(registration("tailscale-operator").opts.transforms).toHaveLength(1);
	});
});

test("loads the bootstrap script and substitutes only the SSH port", () => {
	const instance = resources.find(
		(resource) => resource.type === "aws:lightsail/instance:Instance",
	);
	const original = readFileSync(
		new URL("../Amazon/Vps/init.sh", import.meta.url),
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

	test("adds the TLS checksum only after rendering and preserves pod annotations", async () => {
		const checksum = output("TEST-CHECKSUM");
		const args: ResourceTransformArgs = {
			type: "kubernetes:apps/v1:StatefulSet",
			name: "vault",
			custom: true,
			opts: {},
			props: {
				spec: {
					replicas: 1,
					template: { metadata: { annotations: { existing: "preserved" } } },
				},
			},
		};
		const result = addTlsChecksum(args, checksum);
		expect(result?.props.spec.replicas).toBe(1);
		expect(result?.props.spec.template.metadata.annotations.existing).toBe("preserved");
		expect(
			await resolveOutput<string>(
				result?.props.spec.template.metadata.annotations["checksum/internal-tls"],
			),
		).toBe("TEST-CHECKSUM");
		expect(args.props.spec.template.metadata.annotations).toEqual({
			existing: "preserved",
		});
		expect(result?.opts).toBe(args.opts);
		expect(
			addTlsChecksum({ ...args, type: "kubernetes:helm.sh/v4:Chart" }, checksum),
		).toBeUndefined();
		expect(() => addTlsChecksum({ ...args, props: {} }, checksum)).toThrow();
	});
});
