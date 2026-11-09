import type { Resource } from "@pulumi/pulumi";
import { core, helm, rbac } from "@pulumi/kubernetes";
import { Config } from "@pulumi/pulumi";

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

// oxlint-disable-next-line max-lines-per-function -- Keep the monitoring resources and dependencies together.
export function createMonitoring(tailscaleOperator: Resource): {
	victoriaMetrics: helm.v4.Chart;
	grafana: helm.v4.Chart;
} {
	const config = new Config();
	const adminPassword = config.requireSecret("grafanaAdminPassword").apply((value) => {
		if (value.trim().length === 0) {
			throw new Error("Monitoring: grafanaAdminPassword must not be empty.");
		}
		return value;
	});
	const namespace = new core.v1.Namespace("monitoring", {
		metadata: { name: "monitoring" },
	});
	const adminSecret = new core.v1.Secret(
		"grafana-admin",
		{
			metadata: { name: "grafana-admin", namespace: namespace.metadata.name },
			type: "Opaque",
			stringData: { "admin-user": "admin", "admin-password": adminPassword },
		},
		{ additionalSecretOutputs: ["data", "stringData"] },
	);
	const scrapeRole = new rbac.v1.ClusterRole("monitoring-scrape", {
		metadata: { name: "monitoring-scrape" },
		rules: [
			{ apiGroups: [""], resources: ["nodes"], verbs: ["get", "list", "watch"] },
			{ apiGroups: [""], resources: ["nodes/proxy"], verbs: ["get"] },
			{ nonResourceURLs: ["/metrics"], verbs: ["get"] },
		],
	});
	const scrapeBinding = new rbac.v1.ClusterRoleBinding("monitoring-scrape", {
		metadata: { name: "monitoring-scrape" },
		roleRef: {
			apiGroup: "rbac.authorization.k8s.io",
			kind: "ClusterRole",
			name: scrapeRole.metadata.name,
		},
		subjects: [
			{
				kind: "ServiceAccount",
				name: "victoria-metrics",
				namespace: namespace.metadata.name,
			},
		],
	});
	const victoriaMetrics = new helm.v4.Chart(
		"victoria-metrics",
		{
			name: "victoria-metrics",
			chart: "victoria-metrics-single",
			version: "0.50.0",
			namespace: namespace.metadata.name,
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
					ingress: {
						...tailscaleIngress("victoriametrics"),
						hosts: [{ name: "victoriametrics", path: ["/"], port: "http" }],
					},
				},
			},
		},
		{ dependsOn: [namespace, scrapeBinding, tailscaleOperator] },
	);
	const grafana = new helm.v4.Chart(
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
				"grafana.ini": {
					analytics: { reporting_enabled: false, check_for_updates: false },
				},
			},
		},
		{ dependsOn: [namespace, adminSecret, victoriaMetrics, tailscaleOperator] },
	);
	return { victoriaMetrics, grafana };
}
