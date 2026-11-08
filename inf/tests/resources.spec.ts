import type { ResourceTransformArgs } from "@pulumi/pulumi";
import { parseSshPort } from "../Amazon/src/vps/server.ts";
import { addAdmissionTls } from "../Kubernetes/src/apps/monitoring.ts";
import { normalizeDownwardApi } from "../Kubernetes/src/apps/tailscale.ts";
import { addTlsChecksum } from "../Kubernetes/src/apps/vault.ts";
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
		expect(registration("state-secrets-key", "aws:kms/key:Key").opts.protect).toBe(true);
		expect(registration("vault-ingress").opts.dependsOn).toEqual([
			registration("vault", "kubernetes:helm.sh/v4:Chart").resource,
			registration("tailscale-operator").resource,
		]);
		expect(registration("kube-prometheus-stack").opts.dependsOn).toEqual([
			registration("monitoring", "kubernetes:core/v1:Namespace").resource,
			registration("grafana-admin").resource,
			registration("monitoring-admission-tls").resource,
			registration("tailscale-operator").resource,
		]);
		for (const name of [
			"vault-internal-tls",
			"tailscale-operator-oauth",
			"grafana-admin",
			"monitoring-admission-tls",
		]) {
			const options = registration(name).opts;
			if (!("additionalSecretOutputs" in options)) {
				throw new Error(`Missing secret outputs for ${name}.`);
			}
			expect(options.additionalSecretOutputs).toEqual(
				expect.arrayContaining(["data", "stringData"]),
			);
		}
		expect(registration("tailscale-operator").opts.transforms).toHaveLength(1);
		expect(registration("kube-prometheus-stack").opts.transforms).toHaveLength(1);
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

test("deploys the monitoring chart with tagged Tailscale HTTPS access and secret credentials", () => {
	const chart = resources.find(
		(resource) =>
			resource.type === "kubernetes:helm.sh/v4:Chart" &&
			resource.name === "kube-prometheus-stack",
	);
	expect(chart?.inputs).toMatchObject({
		name: "kube-prometheus-stack",
		chart: "kube-prometheus-stack",
		version: "93.1.0",
		namespace: "monitoring",
		repositoryOpts: { repo: "https://prometheus-community.github.io/helm-charts" },
		values: {
			prometheusOperator: {
				tls: { enabled: true },
				admissionWebhooks: {
					enabled: true,
					failurePolicy: "Fail",
					patch: { enabled: false },
					certManager: { enabled: false },
				},
			},
			grafana: {
				enabled: true,
				admin: {
					existingSecret: "grafana-admin",
					userKey: "admin-user",
					passwordKey: "admin-password",
				},
				ingress: {
					enabled: true,
					ingressClassName: "tailscale",
					annotations: {
						"tailscale.com/tags": "tag:monitoring",
						"tailscale.com/http-redirect": "true",
					},
					hosts: ["grafana"],
					path: "/",
					pathType: "Prefix",
					tls: [{ hosts: ["grafana"] }],
				},
			},
			prometheus: {
				enabled: true,
				ingress: {
					enabled: true,
					ingressClassName: "tailscale",
					annotations: {
						"tailscale.com/tags": "tag:monitoring",
						"tailscale.com/http-redirect": "true",
					},
					hosts: ["prometheus"],
					paths: ["/"],
					pathType: "Prefix",
					tls: [{ hosts: ["prometheus"] }],
				},
			},
		},
	});
	const credentials = resources.find(
		(resource) =>
			resource.type === "kubernetes:core/v1:Secret" && resource.name === "grafana-admin",
	);
	expect(credentials?.inputs.metadata).toMatchObject({
		name: "grafana-admin",
		namespace: "monitoring",
	});
	expect(JSON.stringify(chart?.inputs)).not.toContain("test-grafana-password");
});

test("provisions the admission TLS secret with the chart's non-hook key names and service SAN", () => {
	const tlsSecret = resources.find(
		(resource) => resource.name === "monitoring-admission-tls",
	);
	expect(tlsSecret?.inputs).toMatchObject({
		metadata: { name: "kube-prometheus-stack-admission", namespace: "monitoring" },
		type: "Opaque",
		stringData: {
			value: {
				ca: "test-certificate",
				cert: "test-certificate",
				key: "test-private-pem",
			},
		},
	});
	const certificate = resources.find(
		(resource) => resource.name === "monitoring-admission-tls-cert",
	);
	expect(certificate?.inputs).toMatchObject({
		isCaCertificate: true,
		dnsNames: expect.arrayContaining(["kube-prometheus-stack-operator.monitoring.svc"]),
		allowedUses: expect.arrayContaining(["cert_signing", "server_auth"]),
		validityPeriodHours: 8760,
		earlyRenewalHours: 720,
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
	test.each(["MutatingWebhookConfiguration", "ValidatingWebhookConfiguration"])(
		"injects admission CA trust into %s without mutating the rendered resources",
		async (kind) => {
			const args: ResourceTransformArgs = {
				type: `kubernetes:admissionregistration.k8s.io/v1:${kind}`,
				name: "admission",
				custom: true,
				opts: {},
				props: {
					metadata: {
						name: "kube-prometheus-stack-admission",
						annotations: { existing: "preserved" },
					},
					webhooks: [
						{ name: "first", clientConfig: { service: { name: "operator" } } },
						{ name: "second", clientConfig: { caBundle: "old" } },
					],
				},
			};
			const original = structuredClone(args.props);
			const result = addAdmissionTls(args, output("test-certificate"));
			const caBundles = await Promise.all(
				[0, 1].map((index) =>
					resolveOutput<string>(result?.props.webhooks[index].clientConfig.caBundle),
				),
			);
			expect(caBundles).toEqual(["dGVzdC1jZXJ0aWZpY2F0ZQ==", "dGVzdC1jZXJ0aWZpY2F0ZQ=="]);
			expect(result?.props.webhooks[0].clientConfig.service.name).toBe("operator");
			expect(result?.props.metadata.annotations).toMatchObject({
				existing: "preserved",
				"config.kubernetes.io/depends-on":
					"apps/namespaces/monitoring/Deployment/kube-prometheus-stack-operator",
			});
			expect(result?.opts).toBe(args.opts);
			expect(args.props).toEqual(original);
			expect(
				addAdmissionTls(
					{ ...args, props: { ...args.props, metadata: { name: "unrelated" } } },
					output("test-certificate"),
				),
			).toBeUndefined();
			expect(() =>
				addAdmissionTls(
					{ ...args, props: { ...args.props, webhooks: null } },
					output("cert"),
				),
			).toThrow();
		},
	);

	test("rolls only the monitoring operator when its admission certificate changes", async () => {
		const args: ResourceTransformArgs = {
			type: "kubernetes:apps/v1:Deployment",
			name: "operator",
			custom: true,
			opts: {},
			props: {
				metadata: { name: "kube-prometheus-stack-operator" },
				spec: {
					template: { metadata: { annotations: { existing: "preserved" } } },
				},
			},
		};
		const original = structuredClone(args.props);
		const first = addAdmissionTls(args, output("first"));
		const second = addAdmissionTls(args, output("second"));
		expect(
			await resolveOutput(
				first?.props.spec.template.metadata.annotations["checksum/internal-tls"],
			),
		).not.toBe(
			await resolveOutput(
				second?.props.spec.template.metadata.annotations["checksum/internal-tls"],
			),
		);
		expect(first?.props.spec.template.metadata.annotations.existing).toBe("preserved");
		expect(args.props).toEqual(original);
		expect(
			addAdmissionTls(
				{ ...args, props: { ...args.props, metadata: { name: "grafana" } } },
				output("cert"),
			),
		).toBeUndefined();
		expect(
			addAdmissionTls({ ...args, type: "kubernetes:core/v1:Service" }, output("cert")),
		).toBeUndefined();
	});

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
