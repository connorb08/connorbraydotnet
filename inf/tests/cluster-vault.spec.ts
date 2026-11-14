import type {
	Resource,
	ResourceTransformArgs,
	ResourceTransformationArgs,
} from "@pulumi/pulumi";
import { ClusterApps } from "../Cluster/src/apps/index.ts";
import { requireRecord } from "../Cluster/src/utils.ts";
import { resolveOutput } from "./mock-runtime.ts";
import { isSecret, output, runtime } from "@pulumi/pulumi";
import { beforeAll, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const resources: { type: string; name: string; inputs: Record<string, unknown> }[] = [];
const registrations: ResourceTransformationArgs[] = [];
let apps: ClusterApps;

function registration(name: string, type?: string) {
	const found = registrations.find(
		(args) => args.name === name && (type === undefined || args.type === type),
	);
	if (!found) {
		throw new Error(`Missing registration: ${name} (${type})`);
	}
	return found;
}

beforeAll(async () => {
	await runtime.setMocks(
		{
			newResource: (args) => {
				const inputs = requireRecord(args.inputs, "Mock inputs must be a mapping.");
				resources.push({ type: args.type, name: args.name, inputs });
				const state = { ...inputs };
				if (args.type === "tls:index/privateKey:PrivateKey") {
					state.privateKeyPem = "test-private-pem";
				}
				if (args.type === "tls:index/selfSignedCert:SelfSignedCert") {
					state.certPem = "test-certificate";
				}
				return { id: args.name, state };
			},
			call: (args) => args.inputs,
		},
		"Cluster",
		"test",
		false,
	);
	runtime.setAllConfig(
		{
			"Cluster:tailscaleClientId": "test-client-id",
			"Cluster:tailscaleClientSecret": "test-client-secret",
			"Cluster:couchdbAdminPassword": "test-couchdb-password",
			"Cluster:couchdbCookieAuthSecret": "test-couchdb-cookie-secret",
			"Cluster:couchdbErlangCookie": "test-couchdb-erlang-cookie",
			"Cluster:grafanaAdminPassword": "test-grafana-password",
		},
		[
			"Cluster:tailscaleClientId",
			"Cluster:tailscaleClientSecret",
			"Cluster:couchdbAdminPassword",
			"Cluster:couchdbCookieAuthSecret",
			"Cluster:couchdbErlangCookie",
			"Cluster:grafanaAdminPassword",
		],
	);
	await runtime.runInPulumiStack(async () => {
		runtime.registerStackTransformation((args) => {
			registrations.push(args);
		});
		apps = new ClusterApps("cluster-apps");
		return { vaultInternalCaCert: apps.vault.internalCaCert };
	});
	await runtime.disconnect();
});

test("creates the Vault component with internal TLS and ordered Tailscale ingress", async () => {
	expect<Resource>(apps.vault).toBe(
		registration("vault", "connor-bray:infrastructure:cluster:apps:Vault").resource,
	);
	expect(
		registration("vault", "connor-bray:infrastructure:cluster:apps:Vault").opts.parent,
	).toBe(apps);
	for (const [name, type] of [
		["vault", "kubernetes:core/v1:Namespace"],
		["vault-internal-tls-key", "tls:index/privateKey:PrivateKey"],
		["vault-internal-tls-cert", "tls:index/selfSignedCert:SelfSignedCert"],
		["vault-internal-tls", "kubernetes:core/v1:Secret"],
		["vault", "kubernetes:helm.sh/v4:Chart"],
		["vault-ingress", "kubernetes:networking.k8s.io/v1:Ingress"],
	] as const) {
		expect(registration(name, type).opts.parent).toBe(apps.vault);
	}
	const tlsSecret = registration("vault-internal-tls", "kubernetes:core/v1:Secret");
	if (!("additionalSecretOutputs" in tlsSecret.opts)) {
		throw new Error("Missing TLS secret output protection.");
	}
	expect(tlsSecret.opts.additionalSecretOutputs).toEqual(
		expect.arrayContaining(["data", "stringData"]),
	);
	expect(await isSecret(tlsSecret.props.stringData["tls.key"])).toBe(true);
	const chart = registration("vault", "kubernetes:helm.sh/v4:Chart");
	expect(chart.opts.dependsOn).toEqual([tlsSecret.resource, apps.storage.chart]);
	expect(registration("vault-ingress").opts.dependsOn).toEqual([
		apps.vault.chart,
		apps.tailscale.chart,
	]);
	expect(await resolveOutput(apps.vault.namespaceName)).toBe("vault");
	expect(await resolveOutput(apps.vault.internalCaCert)).toBe("test-certificate");
	expect(apps.apps.has("vault")).toBe(true);
	const chartInputs = resources.find(
		(args) => args.name === "vault" && args.type === "kubernetes:helm.sh/v4:Chart",
	)?.inputs;
	expect(chartInputs).toMatchObject({
		namespace: "vault",
		values: {
			global: { tlsDisable: false },
			server: {
				dataStorage: { enabled: true, size: "10Gi" },
				ha: { enabled: true, replicas: 1, raft: { enabled: true } },
			},
			ui: { externalPort: 443, targetPort: 8200 },
		},
	});
	expect(chartInputs).not.toHaveProperty("values.server.dataStorage.storageClass");
	const transform = chart.opts.transforms?.[0];
	if (!transform) {
		throw new Error("Missing Vault TLS checksum transform.");
	}
	const result = await transform({
		type: "kubernetes:apps/v1:StatefulSet",
		name: "vault",
		custom: true,
		props: { spec: { template: { metadata: {} } } },
		opts: {},
	});
	if (!result) {
		throw new Error("Vault StatefulSet was not transformed.");
	}
	expect(
		await resolveOutput<string>(
			result.props.spec.template.metadata.annotations["checksum/internal-tls"],
		),
	).toBe(
		createHash("sha256").update("test-certificate", "utf8").digest("hex").toUpperCase(),
	);
});

test("only annotates Vault StatefulSets and preserves existing pod annotations", async () => {
	const args: ResourceTransformArgs = {
		type: "kubernetes:apps/v1:StatefulSet",
		name: "vault",
		custom: true,
		props: { spec: { template: { metadata: { annotations: { existing: "kept" } } } } },
		opts: {},
	};
	const original = structuredClone(args.props);
	const transform = registration("vault", "kubernetes:helm.sh/v4:Chart").opts
		.transforms?.[0];
	if (!transform) {
		throw new Error("Missing Vault TLS checksum transform.");
	}
	const result = await transform(args);
	if (!result) {
		throw new Error("Vault StatefulSet was not transformed.");
	}
	expect(result.props.spec.template.metadata.annotations.existing).toBe("kept");
	expect(
		await resolveOutput<string>(
			result.props.spec.template.metadata.annotations["checksum/internal-tls"],
		),
	).toBe(
		createHash("sha256").update("test-certificate", "utf8").digest("hex").toUpperCase(),
	);
	expect(args.props).toEqual(original);
	expect(
		await transform({ ...args, type: "kubernetes:apps/v1:Deployment" }),
	).toBeUndefined();
});

test("creates CouchDB with protected credentials, rollout checksum, and retained storage", async () => {
	const component = registration(
		"couchdb",
		"connor-bray:infrastructure:cluster:apps:Couchdb",
	);
	expect(component.resource).toBe(apps.couchdb);
	expect(component.opts.parent).toBe(apps);
	expect(apps.apps.has("couchdb")).toBe(true);
	const credentials = registration("couchdb-admin", "kubernetes:core/v1:Secret");
	expect(credentials.opts.parent).toBe(apps.couchdb);
	expect(await isSecret(credentials.props.stringData.adminPassword)).toBe(true);
	expect(await isSecret(credentials.props.stringData.cookieAuthSecret)).toBe(true);
	expect(await isSecret(credentials.props.stringData.erlangCookie)).toBe(true);
	const chart = registration("couchdb", "kubernetes:helm.sh/v4:Chart");
	expect(chart.opts.parent).toBe(apps.couchdb);
	expect(chart.opts.dependsOn).toEqual([
		registration("couchdb", "kubernetes:core/v1:Namespace").resource,
		credentials.resource,
		apps.tailscale.chart,
		apps.storage.chart,
	]);
	expect(chart.props.values).toMatchObject({
		clusterSize: 1,
		allowAdminParty: false,
		createAdminSecret: false,
		extraSecretName: "couchdb-admin",
		persistentVolume: { enabled: true, size: "5Gi" },
		persistentVolumeClaimRetentionPolicy: {
			enabled: true,
			whenScaled: "Retain",
			whenDeleted: "Retain",
		},
		ingress: { className: "tailscale", hosts: ["couchdb"] },
		couchdbConfig: {
			couchdb: { single_node: true },
			chttpd: { require_valid_user: true },
			cors: { credentials: true },
		},
	});
	const checksum = chart.props.values.annotations["checksum/credentials"];
	expect(await isSecret(checksum)).toBe(false);
	expect(await resolveOutput<string>(checksum)).toBe(
		createHash("sha256")
			.update(
				JSON.stringify([
					"test-couchdb-password",
					"test-couchdb-cookie-secret",
					"test-couchdb-erlang-cookie",
				]),
			)
			.digest("hex"),
	);
});

test("creates Prometheus with API and node scraping and ordered dependencies", async () => {
	expect(
		registration("monitoring", "connor-bray:infrastructure:cluster:apps:Monitoring")
			.resource,
	).toBe(apps.monitoring);
	expect(apps.apps.has("monitoring")).toBe(true);
	const prometheus = registration("prometheus", "kubernetes:helm.sh/v4:Chart");
	expect(prometheus.opts.parent).toBe(apps.monitoring);
	expect(prometheus.opts.dependsOn).toEqual([
		registration("monitoring", "kubernetes:core/v1:Namespace").resource,
		registration(
			"monitoring-scrape",
			"kubernetes:rbac.authorization.k8s.io/v1:ClusterRoleBinding",
		).resource,
		apps.tailscale.chart,
		apps.storage.chart,
	]);
	expect(prometheus.props).toMatchObject({
		chart: "prometheus",
		values: {
			rbac: { create: false },
			scrapeConfigs: null,
			serviceAccounts: { server: { create: true, name: "prometheus" } },
			server: {
				fullnameOverride: "prometheus",
				automountServiceAccountToken: true,
				retention: "7d",
				retentionSize: "4GB",
				service: { servicePort: 9090 },
				persistentVolume: { enabled: true, size: "5Gi" },
				ingress: { ingressClassName: "tailscale", hosts: ["prometheus"] },
			},
		},
	});
	const scrapeConfigs =
		prometheus.props.values.serverFiles["prometheus.yml"].scrape_configs;
	expect(scrapeConfigs).toMatchObject([
		{ job_name: "prometheus", static_configs: [{ targets: ["localhost:9090"] }] },
		{ job_name: "kubernetes-apiservers", scheme: "https" },
		{
			job_name: "kubernetes-nodes",
			kubernetes_sd_configs: [{ role: "node" }],
			relabel_configs: [
				{ target_label: "__address__", replacement: "kubernetes.default.svc:443" },
				{
					target_label: "__metrics_path__",
					replacement: "/api/v1/nodes/$1/proxy/metrics",
				},
				{ target_label: "node" },
				{ target_label: "instance" },
			],
		},
		{
			job_name: "kubernetes-cadvisor",
			relabel_configs: [
				{ target_label: "__address__", replacement: "kubernetes.default.svc:443" },
				{
					target_label: "__metrics_path__",
					replacement: "/api/v1/nodes/$1/proxy/metrics/cadvisor",
				},
				{ target_label: "node" },
				{ target_label: "instance" },
			],
		},
	]);
	expect(
		await resolveOutput(
			output(
				registration(
					"monitoring-scrape",
					"kubernetes:rbac.authorization.k8s.io/v1:ClusterRoleBinding",
				).props.subjects,
			),
		),
	).toEqual([
		{
			kind: "ServiceAccount",
			name: "prometheus",
			namespace: "monitoring",
		},
	]);
	expect(resources.some((resource) => resource.name.includes("victoria"))).toBe(false);
});

test("connects Grafana to Prometheus with protected credentials and ordered dependencies", async () => {
	const grafana = registration("grafana", "kubernetes:helm.sh/v4:Chart");
	const secret = registration("grafana-admin", "kubernetes:core/v1:Secret");
	expect(await isSecret(secret.props.stringData["admin-password"])).toBe(true);
	expect(grafana.opts.dependsOn).toEqual([
		registration("monitoring", "kubernetes:core/v1:Namespace").resource,
		secret.resource,
		apps.monitoring.prometheus,
		apps.tailscale.chart,
		apps.storage.chart,
	]);
	expect(grafana.props.values).toMatchObject({
		admin: { existingSecret: "grafana-admin" },
		ingress: { ingressClassName: "tailscale", hosts: ["grafana"] },
		persistence: { enabled: true, size: "1Gi" },
		datasources: {
			"datasources.yaml": {
				datasources: [
					{
						name: "Prometheus",
						type: "prometheus",
						url: "http://prometheus.monitoring.svc:9090",
						isDefault: true,
					},
				],
			},
		},
	});
});

test("monitoring PVC transforms preserve options and ignore cluster-assigned volume bindings", async () => {
	const transform = registration("grafana", "kubernetes:helm.sh/v4:Chart").opts
		.transforms?.[0];
	if (!transform) {
		throw new Error("Missing monitoring PVC transform.");
	}
	const args: ResourceTransformArgs = {
		type: "kubernetes:core/v1:PersistentVolumeClaim",
		name: "grafana",
		custom: true,
		props: { spec: { resources: { requests: { storage: "1Gi" } } } },
		opts: { ignoreChanges: ["metadata.annotations"], protect: true },
	};
	const result = await transform(args);
	expect(result).toEqual({
		props: args.props,
		opts: { ignoreChanges: ["metadata.annotations", "spec.volumeName"], protect: true },
	});
	expect(args.opts.ignoreChanges).toEqual(["metadata.annotations"]);
	expect(
		await transform({ ...args, type: "kubernetes:apps/v1:Deployment" }),
	).toBeUndefined();
});

test("provisions retained node-local storage on the Talos data mount", async () => {
	const storageChart = registration(
		"local-path-provisioner",
		"kubernetes:helm.sh/v4:Chart",
	);
	expect(storageChart.opts.parent).toBe(apps.storage);
	const namespace = registration("local-path-storage", "kubernetes:core/v1:Namespace");
	expect(namespace.props.metadata.labels["pod-security.kubernetes.io/enforce"]).toBe(
		"privileged",
	);
	expect(storageChart.opts.dependsOn).toEqual([namespace.resource]);
	const inputs = resources.find(
		(args) =>
			args.name === "local-path-provisioner" &&
			args.type === "kubernetes:helm.sh/v4:Chart",
	)?.inputs;
	expect(inputs).toMatchObject({
		values: {
			extraArgs: ["--allow-unsafe-helper-pod-template"],
			storageClass: {
				defaultClass: true,
				defaultVolumeType: "local",
				reclaimPolicy: "Retain",
				volumeBindingMode: "WaitForFirstConsumer",
			},
			nodePathMap: [
				{
					node: "DEFAULT_PATH_FOR_NON_LISTED_NODES",
					paths: ["/var/mnt/cluster-storage"],
				},
			],
		},
	});
	const transform = storageChart.opts.transforms?.[0];
	if (!transform) {
		throw new Error("Missing local storage helper transform.");
	}
	const props = { data: { setup: "preserved", "helperPod.yaml": "original" } };
	const args: ResourceTransformArgs = {
		type: "kubernetes:core/v1:ConfigMap",
		name: "local-path-config",
		custom: true,
		props,
		opts: {},
	};
	const transformed = await transform(args);
	if (!transformed) {
		throw new Error("Local storage ConfigMap was not transformed.");
	}
	expect(transformed.props.data.setup).toBe("preserved");
	expect(JSON.parse(transformed.props.data["helperPod.yaml"])).toMatchObject({
		spec: {
			volumes: [{ name: "boot-var", hostPath: { path: "/var", type: "Directory" } }],
			containers: [
				{
					volumeMounts: [{ name: "boot-var", mountPath: "/host-var", readOnly: true }],
				},
			],
		},
	});
	expect(props.data["helperPod.yaml"]).toBe("original");
	expect(
		await transform({ ...args, type: "kubernetes:apps/v1:Deployment" }),
	).toBeUndefined();
});

test("refuses boot-disk fallback and permits provisioning on a separate filesystem", async () => {
	const inputs = resources.find(
		(args) =>
			args.name === "local-path-provisioner" &&
			args.type === "kubernetes:helm.sh/v4:Chart",
	)?.inputs;
	const values = requireRecord(inputs?.values, "Missing storage chart values.");
	const configmap = requireRecord(
		values.configmap,
		"Missing storage setup configuration.",
	);
	const setup = configmap.setup;
	if (typeof setup !== "string") {
		throw new Error("Storage setup script must be a string.");
	}
	const directory = await mkdtemp(join(tmpdir(), "cluster-storage-test-"));
	const marker = join(directory, "provisioned");
	try {
		await writeFile(
			join(directory, "stat"),
			`#!/bin/sh
if [ "$3" = /host-var ]; then
  printf '%s\\n' "$BOOT_DEVICE"
else
  printf '%s\\n' "$DATA_DEVICE"
fi
`,
			{ mode: 0o700 },
		);
		await writeFile(
			join(directory, "mkdir"),
			'#!/bin/sh\nprintf "created" > "$MARKER"\n',
			{ mode: 0o700 },
		);
		const runSetup = async (dataDevice: string) => {
			const process = Bun.spawn(["/bin/sh", "-c", setup], {
				env: {
					PATH: directory,
					BOOT_DEVICE: "1",
					DATA_DEVICE: dataDevice,
					MARKER: marker,
					VOL_DIR: "/var/mnt/cluster-storage/test-pvc",
				},
				stdout: "pipe",
				stderr: "pipe",
			});
			return {
				exitCode: await process.exited,
				stderr: await new Response(process.stderr).text(),
			};
		};
		const blocked = await runSetup("1");
		expect(blocked.exitCode).toBe(1);
		expect(blocked.stderr).toContain("must be mounted on a separate data disk");
		expect(await Bun.file(marker).exists()).toBe(false);
		expect((await runSetup("2")).exitCode).toBe(0);
		expect(await readFile(marker, "utf8")).toBe("created");
	} finally {
		await rm(directory, { recursive: true, force: true });
	}
});
