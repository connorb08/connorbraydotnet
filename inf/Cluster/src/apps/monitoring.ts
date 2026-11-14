import type { ClusterLocalStorage } from "#storage";
import type {
	ComponentResourceOptions,
	Output,
	Resource,
	ResourceTransformArgs,
	ResourceTransformResult,
} from "@pulumi/pulumi";
import { core, helm, rbac } from "@pulumi/kubernetes";
import { ComponentResource, Config } from "@pulumi/pulumi";

const appName = "monitoring";

export class MonitoringApp extends ComponentResource {
	public readonly namespaceName: Output<string>;
	public readonly prometheus: helm.v4.Chart;
	public readonly grafana: helm.v4.Chart;
	public readonly name: string = appName;

	// oxlint-disable-next-line max-lines-per-function -- Keep the monitoring resources and dependencies together.
	constructor(
		tailscaleOperator: Resource,
		storage: ClusterLocalStorage,
		options?: ComponentResourceOptions,
	) {
		super("connor-bray:infrastructure:cluster:apps:Monitoring", appName, {}, options);

		const config = new Config();
		const adminPassword = config.requireSecret("grafanaAdminPassword").apply((value) => {
			if (value.trim().length === 0) {
				throw new Error("Monitoring: grafanaAdminPassword must not be empty.");
			}
			return value;
		});
		const namespace = new core.v1.Namespace(
			appName,
			{ metadata: { name: appName } },
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
		const scrapeRole = new rbac.v1.ClusterRole(
			"monitoring-scrape",
			{
				metadata: { name: "monitoring-scrape" },
				rules: [
					{ apiGroups: [""], resources: ["nodes"], verbs: ["get", "list", "watch"] },
					{ apiGroups: [""], resources: ["nodes/proxy"], verbs: ["get"] },
					{ nonResourceURLs: ["/metrics"], verbs: ["get"] },
				],
			},
			{ parent: this },
		);
		const scrapeBinding = new rbac.v1.ClusterRoleBinding(
			"monitoring-scrape",
			{
				metadata: { name: "monitoring-scrape" },
				roleRef: {
					apiGroup: "rbac.authorization.k8s.io",
					kind: "ClusterRole",
					name: scrapeRole.metadata.name,
				},
				subjects: [
					{
						kind: "ServiceAccount",
						name: "prometheus",
						namespace: namespace.metadata.name,
					},
				],
			},
			{ parent: this },
		);
		this.prometheus = new helm.v4.Chart(
			"prometheus",
			{
				name: "prometheus",
				chart: "prometheus",
				version: "29.47.2",
				namespace: namespace.metadata.name,
				repositoryOpts: { repo: "https://prometheus-community.github.io/helm-charts" },
				values: {
					rbac: { create: false },
					serviceAccounts: { server: { create: true, name: "prometheus" } },
					alertmanager: { enabled: false },
					"kube-state-metrics": { enabled: false },
					"prometheus-node-exporter": { enabled: false },
					"prometheus-pushgateway": { enabled: false },
					// Remove the chart's default discovery jobs; only the explicit jobs below are authorized.
					scrapeConfigs: null,
					server: {
						fullnameOverride: "prometheus",
						automountServiceAccountToken: true,
						replicaCount: 1,
						retention: "7d",
						retentionSize: "4GB",
						service: { servicePort: 9090 },
						persistentVolume: { enabled: true, size: "5Gi" },
						resources: {
							requests: { cpu: "100m", memory: "256Mi" },
							limits: { cpu: "500m", memory: "512Mi" },
						},
						extraArgs: {
							"query.max-concurrency": "2",
							"query.timeout": "30s",
							"query.max-samples": "1000000",
						},
						global: {
							scrape_interval: "60s",
							scrape_timeout: "10s",
							evaluation_interval: "60s",
						},
						ingress: tailscaleIngress("prometheus"),
					},
					serverFiles: {
						"prometheus.yml": {
							scrape_configs: [
								{
									job_name: "prometheus",
									sample_limit: 10000,
									static_configs: [{ targets: ["localhost:9090"] }],
								},
								{
									job_name: "kubernetes-apiservers",
									sample_limit: 10000,
									scheme: "https",
									bearer_token_file:
										"/var/run/secrets/kubernetes.io/serviceaccount/token",
									tls_config: {
										ca_file: "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt",
									},
									static_configs: [{ targets: ["kubernetes.default.svc:443"] }],
								},
								nodeScrapeJob("kubernetes-nodes", ""),
								nodeScrapeJob("kubernetes-cadvisor", "/cadvisor"),
							],
						},
					},
				},
			},
			{
				dependsOn: [namespace, scrapeBinding, tailscaleOperator, storage.chart],
				transforms: [ignoreVolumeBinding],
				parent: this,
			},
		);
		this.grafana = new helm.v4.Chart(
			"grafana",
			{
				name: "grafana",
				chart: "grafana",
				version: "14.4.0",
				namespace: namespace.metadata.name,
				repositoryOpts: { repo: "https://grafana-community.github.io/helm-charts" },
				values: {
					replicas: 1,
					deploymentStrategy: { type: "Recreate" },
					admin: {
						existingSecret: "grafana-admin",
						userKey: "admin-user",
						passwordKey: "admin-password",
					},
					ingress: tailscaleIngress("grafana"),
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
									name: "Prometheus",
									uid: "prometheus",
									type: "prometheus",
									access: "proxy",
									url: "http://prometheus.monitoring.svc:9090",
									isDefault: true,
									editable: false,
									jsonData: { timeInterval: "60s" },
								},
							],
						},
					},
					"grafana.ini": {
						analytics: { reporting_enabled: false, check_for_updates: false },
					},
				},
			},
			{
				dependsOn: [
					namespace,
					adminSecret,
					this.prometheus,
					tailscaleOperator,
					storage.chart,
				],
				transforms: [ignoreVolumeBinding],
				parent: this,
			},
		);
		this.namespaceName = namespace.metadata.name;
		this.registerOutputs({ namespaceName: this.namespaceName });
	}
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

function tailscaleIngress(hostname: string) {
	return {
		enabled: true,
		ingressClassName: "tailscale",
		annotations: {
			"tailscale.com/tags": "tag:monitoring",
			"tailscale.com/http-redirect": "true",
		},
		hosts: [hostname],
		path: "/",
		pathType: "Prefix",
		tls: [{ hosts: [hostname] }],
	};
}

function nodeScrapeJob(jobName: string, metricsPath: string) {
	return {
		job_name: jobName,
		sample_limit: 10000,
		scheme: "https",
		kubernetes_sd_configs: [{ role: "node" }],
		bearer_token_file: "/var/run/secrets/kubernetes.io/serviceaccount/token",
		tls_config: { ca_file: "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt" },
		relabel_configs: [
			{
				target_label: "__address__",
				replacement: "kubernetes.default.svc:443",
			},
			{
				source_labels: ["__meta_kubernetes_node_name"],
				target_label: "__metrics_path__",
				replacement: `/api/v1/nodes/$1/proxy/metrics${metricsPath}`,
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
	};
}
