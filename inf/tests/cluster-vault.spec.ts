import type {
	Resource,
	ResourceTransformArgs,
	ResourceTransformationArgs,
} from "@pulumi/pulumi";
import { ClusterApps } from "../Cluster/src/apps/index.ts";
import { requireRecord } from "../Cluster/src/utils.ts";
import { resolveOutput } from "./mock-runtime.ts";
import { isSecret, runtime } from "@pulumi/pulumi";
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
		},
		["Cluster:tailscaleClientId", "Cluster:tailscaleClientSecret"],
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
