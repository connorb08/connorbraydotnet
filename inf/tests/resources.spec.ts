import type { ResourceTransformArgs } from "@pulumi/pulumi";
import { parseSshPort } from "../Amazon/src/vps/server.ts";
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
		expect(registration("victoria-metrics").opts.dependsOn).toEqual([
			registration("monitoring", "kubernetes:core/v1:Namespace").resource,
			registration(
				"monitoring-scrape",
				"kubernetes:rbac.authorization.k8s.io/v1:ClusterRoleBinding",
			).resource,
			registration("tailscale-operator").resource,
		]);
		expect(registration("grafana", "kubernetes:helm.sh/v4:Chart").opts.dependsOn).toEqual(
			[
				registration("monitoring", "kubernetes:core/v1:Namespace").resource,
				registration("grafana-admin").resource,
				registration("victoria-metrics").resource,
				registration("tailscale-operator").resource,
			],
		);
		for (const name of [
			"vault-internal-tls",
			"tailscale-operator-oauth",
			"grafana-admin",
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

// oxlint-disable-next-line max-lines-per-function -- Assert the complete scrape and resource configuration.
test("deploys bounded single-node VictoriaMetrics with native Kubernetes scraping", () => {
	const chart = resources.find(
		(resource) =>
			resource.type === "kubernetes:helm.sh/v4:Chart" &&
			resource.name === "victoria-metrics",
	);
	expect(chart?.inputs).toMatchObject({
		name: "victoria-metrics",
		chart: "victoria-metrics-single",
		version: "0.50.0",
		namespace: "monitoring",
		repositoryOpts: { repo: "https://victoriametrics.github.io/helm-charts/" },
		values: {
			rbac: { create: false },
			serviceAccount: { create: true, name: "victoria-metrics", automountToken: true },
			server: {
				fullnameOverride: "victoria-metrics",
				replicaCount: 1,
				retentionPeriod: "7d",
				service: { clusterIP: "" },
				persistentVolume: { enabled: true, size: "5Gi" },
				resources: {
					requests: { cpu: "100m", memory: "128Mi" },
					limits: { cpu: "500m", memory: "384Mi" },
				},
				extraArgs: {
					"memory.allowedBytes": "192MiB",
					"search.maxMemoryPerQuery": "32MiB",
					"search.maxConcurrentRequests": "2",
					"search.maxQueryDuration": "30s",
					"storage.maxHourlySeries": "50000",
					"storage.maxDailySeries": "100000",
					"storage.minFreeDiskSpaceBytes": "256MiB",
					"promscrape.maxScrapeSize": "8MiB",
					"promscrape.streamParse": "true",
				},
				scrape: {
					enabled: true,
					config: {
						global: { scrape_interval: "60s", scrape_timeout: "10s" },
						scrape_configs: [
							{
								job_name: "victoria-metrics",
								sample_limit: 10000,
								static_configs: [{ targets: ["localhost:8428"] }],
							},
							{
								job_name: "kubernetes-apiservers",
								sample_limit: 10000,
								scheme: "https",
								bearer_token_file: "/var/run/secrets/kubernetes.io/serviceaccount/token",
								tls_config: {
									ca_file: "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt",
								},
								static_configs: [{ targets: ["kubernetes.default.svc:443"] }],
							},
							...["kubernetes-nodes", "kubernetes-cadvisor"].map((jobName) => ({
								job_name: jobName,
								sample_limit: 10000,
								scheme: "https",
								kubernetes_sd_configs: [{ role: "node" }],
								bearer_token_file: "/var/run/secrets/kubernetes.io/serviceaccount/token",
								tls_config: {
									ca_file: "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt",
								},
								relabel_configs: [
									{
										target_label: "__address__",
										replacement: "kubernetes.default.svc:443",
									},
									{
										source_labels: ["__meta_kubernetes_node_name"],
										target_label: "__metrics_path__",
										replacement: `/api/v1/nodes/$1/proxy/metrics${jobName === "kubernetes-cadvisor" ? "/cadvisor" : ""}`,
									},
									{
										source_labels: ["__meta_kubernetes_node_name"],
										target_label: "node",
									},
									{
										source_labels: ["__meta_kubernetes_node_name"],
										target_label: "instance",
									},
								],
							})),
						],
					},
				},
				ingress: {
					enabled: true,
					ingressClassName: "tailscale",
					annotations: {
						"tailscale.com/tags": "tag:monitoring",
						"tailscale.com/http-redirect": "true",
					},
					hosts: [{ name: "victoriametrics", path: ["/"], port: "http" }],
					pathType: "Prefix",
					tls: [{ hosts: ["victoriametrics"] }],
				},
			},
		},
	});
	expect(resources.some((resource) => resource.name === "kube-prometheus-stack")).toBe(
		false,
	);
	expect(
		resources.some((resource) => resource.name.startsWith("monitoring-admission-tls")),
	).toBe(false);
});

test("grants the native scraper node discovery and authenticated API proxy access", () => {
	expect(
		resources.find(
			(resource) =>
				resource.type === "kubernetes:rbac.authorization.k8s.io/v1:ClusterRole" &&
				resource.name === "monitoring-scrape",
		)?.inputs,
	).toMatchObject({
		rules: [
			{ apiGroups: [""], resources: ["nodes"], verbs: ["get", "list", "watch"] },
			{ apiGroups: [""], resources: ["nodes/proxy"], verbs: ["get"] },
			{ nonResourceURLs: ["/metrics"], verbs: ["get"] },
		],
	});
	expect(
		resources.find(
			(resource) =>
				resource.type === "kubernetes:rbac.authorization.k8s.io/v1:ClusterRoleBinding" &&
				resource.name === "monitoring-scrape",
		)?.inputs,
	).toMatchObject({
		roleRef: {
			apiGroup: "rbac.authorization.k8s.io",
			kind: "ClusterRole",
			name: "monitoring-scrape",
		},
		subjects: [
			{ kind: "ServiceAccount", name: "victoria-metrics", namespace: "monitoring" },
		],
	});
});

test("deploys bounded Grafana with persistent data, secret credentials and a working datasource URL", () => {
	const chart = resources.find(
		(resource) =>
			resource.type === "kubernetes:helm.sh/v4:Chart" && resource.name === "grafana",
	);
	expect(chart?.inputs).toMatchObject({
		name: "grafana",
		chart: "grafana",
		version: "14.4.0",
		namespace: "monitoring",
		repositoryOpts: { repo: "https://grafana-community.github.io/helm-charts" },
		values: {
			replicas: 1,
			deploymentStrategy: { type: "Recreate" },
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
			persistence: { enabled: true, size: "1Gi" },
			initChownData: { enabled: false },
			testFramework: { enabled: false },
			env: { GOMEMLIMIT: "256MiB", GOGC: "50" },
			resources: {
				requests: { cpu: "50m", memory: "192Mi" },
				limits: { cpu: "250m", memory: "384Mi" },
			},
			sidecar: { dashboards: { enabled: false }, datasources: { enabled: false } },
			datasources: {
				"datasources.yaml": {
					apiVersion: 1,
					datasources: [
						{
							name: "VictoriaMetrics",
							uid: "prometheus",
							type: "prometheus",
							access: "proxy",
							url: "http://victoria-metrics.monitoring.svc:8428",
							isDefault: true,
							editable: false,
							jsonData: { timeInterval: "60s" },
						},
					],
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
