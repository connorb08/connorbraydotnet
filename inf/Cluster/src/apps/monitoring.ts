import type { ClusterLocalStorage } from "#storage";
import type {
	ComponentResourceOptions,
	Output,
	Resource,
	ResourceTransformArgs,
	ResourceTransformResult,
} from "@pulumi/pulumi";
import { requireCredential } from "../../../shared/config.ts";
import { tailscaleIngress } from "../tailscale-ingress.ts";
import { ClusterCertificateManager } from "./cert-manager.ts";
import { LoggingApp } from "./logging.ts";
import { core, helm } from "@pulumi/kubernetes";
import { ComponentResource, Config, createUrn, secret } from "@pulumi/pulumi";
import { PrivateKey, SelfSignedCert } from "@pulumi/tls";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

const appName = "monitoring";
const chartName = "kube-prometheus-stack";
const operatorName = `${chartName}-operator`;
const monitoringCrdDependencies = [
	"alertmanagerconfigs",
	"alertmanagers",
	"podmonitors",
	"probes",
	"prometheusagents",
	"prometheuses",
	"prometheusrules",
	"scrapeconfigs",
	"servicemonitors",
	"thanosrulers",
]
	.map(
		(name) =>
			`apiextensions.k8s.io/CustomResourceDefinition/${name}.monitoring.coreos.com`,
	)
	.join(",");

export class MonitoringApp extends ComponentResource {
	public readonly namespaceName: Output<string>;
	public readonly chart: helm.v4.Chart;
	public readonly logging: LoggingApp;
	public readonly certificates: ClusterCertificateManager;
	public readonly name: string = appName;

	// oxlint-disable-next-line max-lines-per-function -- Keep the monitoring resources and dependencies together.
	constructor(
		tailscaleOperator: Resource,
		storage: ClusterLocalStorage,
		options?: ComponentResourceOptions,
	) {
		super("connor-bray:infrastructure:cluster:apps:Monitoring", appName, {}, options);

		const config = new Config();
		const adminPassword = requireCredential(config, "grafanaAdminPassword", "Monitoring");
		const namespace = new core.v1.Namespace(
			appName,
			{
				metadata: {
					name: appName,
					// Node exporter requires host namespaces and read-only host filesystem mounts.
					labels: { "pod-security.kubernetes.io/enforce": "privileged" },
				},
			},
			{ parent: this },
		);
		const adminSecret = new core.v1.Secret(
			"grafana-admin",
			{
				metadata: { name: "grafana-admin", namespace: namespace.metadata.name },
				type: "Opaque",
				stringData: { "admin-user": "admin", "admin-password": adminPassword },
			},
			{ additionalSecretOutputs: ["data", "stringData"], parent: this },
		);
		this.certificates = new ClusterCertificateManager(namespace, { parent: this });
		this.logging = new LoggingApp(namespace, storage, this.certificates, {
			parent: this,
		});
		const { certificate, tlsSecret } = createAdmissionTls(namespace, this);
		const webhookAnnotations = {
			"config.kubernetes.io/depends-on": `apps/namespaces/monitoring/Deployment/${operatorName}`,
		};
		const legacyGrafanaChartUrn = createUrn(
			"grafana",
			"kubernetes:helm.sh/v4:Chart",
			this.urn,
		);
		this.chart = new helm.v4.Chart(
			chartName,
			{
				name: chartName,
				chart: chartName,
				version: "93.3.0",
				namespace: namespace.metadata.name,
				repositoryOpts: { repo: "https://prometheus-community.github.io/helm-charts" },
				values: {
					fullnameOverride: chartName,
					defaultRules: {
						create: true,
						rules: {
							etcd: false,
							kubeControllerManager: false,
							kubeSchedulerAlerting: false,
							kubeSchedulerRecording: false,
							kubeProxy: false,
						},
					},
					// Talos does not expose these metrics endpoints by default.
					kubeEtcd: { enabled: false },
					kubeControllerManager: { enabled: false },
					kubeScheduler: { enabled: false },
					kubeProxy: { enabled: false },
					nodeExporter: { enabled: true },
					kubeStateMetrics: { enabled: true },
					"prometheus-node-exporter": {
						hostRootFsMount: { enabled: true, mountPropagation: "None" },
						resources: {
							requests: { cpu: "10m", memory: "32Mi" },
							limits: { cpu: "100m", memory: "128Mi" },
						},
					},
					"kube-state-metrics": {
						resources: {
							requests: { cpu: "10m", memory: "32Mi" },
							limits: { cpu: "100m", memory: "128Mi" },
						},
					},
					prometheusOperator: {
						enabled: true,
						// The Operator discovers available controllers only at startup.
						annotations: {
							"config.kubernetes.io/depends-on": monitoringCrdDependencies,
						},
						tls: { enabled: true },
						// Pulumi Chart does not execute the certificate-generation Helm hooks.
						admissionWebhooks: {
							enabled: true,
							failurePolicy: "Fail",
							patch: { enabled: false },
							certManager: { enabled: false },
							caBundle: certificate.certPem.apply((pem) =>
								Buffer.from(pem, "utf8").toString("base64"),
							),
							mutatingWebhookConfiguration: { annotations: webhookAnnotations },
							validatingWebhookConfiguration: { annotations: webhookAnnotations },
						},
						podAnnotations: {
							"checksum/admission-tls": certificate.certPem.apply((pem) =>
								createHash("sha256").update(pem, "utf8").digest("hex"),
							),
						},
						resources: {
							requests: { cpu: "50m", memory: "64Mi" },
							limits: { cpu: "250m", memory: "256Mi" },
						},
					},
					prometheus: {
						enabled: true,
						ingress: tailscaleIngress({
							hostname: "prometheus",
							tags: ["tag:monitoring"],
						}),
						prometheusSpec: {
							replicas: 1,
							retention: "7d",
							retentionSize: "4GB",
							scrapeInterval: "60s",
							evaluationInterval: "60s",
							resources: {
								requests: { cpu: "100m", memory: "256Mi" },
								limits: { cpu: "500m", memory: "1Gi" },
							},
							storageSpec: {
								volumeClaimTemplate: {
									spec: {
										accessModes: ["ReadWriteOnce"],
										resources: { requests: { storage: "5Gi" } },
									},
								},
							},
						},
					},
					alertmanager: {
						enabled: true,
						alertmanagerSpec: {
							resources: {
								requests: { cpu: "10m", memory: "32Mi" },
								limits: { cpu: "100m", memory: "128Mi" },
							},
							storage: {
								volumeClaimTemplate: {
									spec: {
										accessModes: ["ReadWriteOnce"],
										resources: { requests: { storage: "1Gi" } },
									},
								},
							},
						},
					},
					grafana: {
						enabled: true,
						fullnameOverride: "grafana",
						annotations: {
							"secret.reloader.stakater.com/reload": this.logging.grafanaTlsSecretName,
							"configmap.reloader.stakater.com/reload": "grafana-loki-proxy",
						},
						extraContainers: [this.logging.grafanaProxy],
						extraContainerVolumes: this.logging.grafanaVolumes,
						additionalDataSources: [
							{
								name: "Loki",
								uid: "loki",
								type: "loki",
								access: "proxy",
								url: "http://127.0.0.1:13100",
								isDefault: false,
								editable: false,
							},
						],
						defaultDashboardsEnabled: true,
						replicas: 1,
						deploymentStrategy: { type: "Recreate" },
						admin: {
							existingSecret: "grafana-admin",
							userKey: "admin-user",
							passwordKey: "admin-password",
						},
						ingress: tailscaleIngress({
							hostname: "grafana",
							tags: ["tag:monitoring"],
						}),
						persistence: { enabled: true, size: "1Gi" },
						initChownData: { enabled: false },
						testFramework: { enabled: false },
						env: { GOMEMLIMIT: "256MiB", GOGC: "50" },
						resources: {
							requests: { cpu: "50m", memory: "192Mi" },
							limits: { cpu: "250m", memory: "384Mi" },
						},
						sidecar: {
							dashboards: { enabled: true },
							datasources: { enabled: true, defaultDatasourceEnabled: true },
							resources: {
								requests: { cpu: "10m", memory: "32Mi" },
								limits: { cpu: "100m", memory: "128Mi" },
							},
						},
						"grafana.ini": {
							analytics: { reporting_enabled: false, check_for_updates: false },
						},
					},
				},
			},
			{
				dependsOn: [
					namespace,
					adminSecret,
					tlsSecret,
					tailscaleOperator,
					storage.chart,
					this.logging.loki,
					this.logging.grafanaCertificate,
				],
				transforms: [
					ignoreVolumeBinding,
					(args) => migrateGrafanaResources(args, legacyGrafanaChartUrn),
				],
				parent: this,
			},
		);
		this.namespaceName = namespace.metadata.name;
		this.registerOutputs({ namespaceName: this.namespaceName });
	}
}

function migrateGrafanaResources(
	args: ResourceTransformArgs,
	legacyChartUrn: Output<string>,
): ResourceTransformResult | undefined {
	const prefix = `${chartName}:`;
	if (!args.name.startsWith(prefix)) {
		return undefined;
	}
	const name = args.name.slice(prefix.length);
	if (
		name !== "monitoring/grafana" &&
		name !== "grafana-clusterrole" &&
		name !== "grafana-clusterrolebinding"
	) {
		return undefined;
	}
	return {
		props: args.props,
		opts: {
			...args.opts,
			aliases: [
				...(args.opts.aliases ?? []),
				{ name: `grafana:${name}`, parent: legacyChartUrn },
			],
			// Replace changed selectors/configuration in place without touching the PVC.
			...(args.type === "kubernetes:apps/v1:Deployment" ||
			args.type === "kubernetes:core/v1:ConfigMap"
				? { deleteBeforeReplace: true }
				: {}),
		},
	};
}

function createAdmissionTls(namespace: core.v1.Namespace, parent: Resource) {
	const privateKey = new PrivateKey(
		"monitoring-admission-tls-key",
		{ algorithm: "RSA", rsaBits: 2048 },
		{ parent },
	);
	const certificate = new SelfSignedCert(
		"monitoring-admission-tls-cert",
		{
			privateKeyPem: secret(privateKey.privateKeyPem),
			isCaCertificate: true,
			subject: { commonName: `${operatorName}.monitoring.svc` },
			dnsNames: [
				operatorName,
				`${operatorName}.monitoring`,
				`${operatorName}.monitoring.svc`,
				`${operatorName}.monitoring.svc.cluster.local`,
			],
			allowedUses: [
				"cert_signing",
				"key_encipherment",
				"digital_signature",
				"server_auth",
			],
			validityPeriodHours: 8760,
			earlyRenewalHours: 720,
		},
		{ parent },
	);
	const tlsSecret = new core.v1.Secret(
		"monitoring-admission-tls",
		{
			metadata: {
				name: `${chartName}-admission`,
				namespace: namespace.metadata.name,
			},
			type: "Opaque",
			stringData: {
				ca: certificate.certPem,
				cert: certificate.certPem,
				key: secret(privateKey.privateKeyPem),
			},
		},
		{ additionalSecretOutputs: ["data", "stringData"], parent },
	);
	return { certificate, tlsSecret };
}

function ignoreVolumeBinding(
	args: ResourceTransformArgs,
): ResourceTransformResult | undefined {
	if (args.type !== "kubernetes:core/v1:PersistentVolumeClaim") {
		return undefined;
	}
	return {
		props: args.props,
		opts: {
			...args.opts,
			ignoreChanges: [...(args.opts.ignoreChanges ?? []), "spec.volumeName"],
		},
	};
}
