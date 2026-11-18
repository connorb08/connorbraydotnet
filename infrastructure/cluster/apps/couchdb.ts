import type { ClusterLocalStorage } from "#storage";
import type { ComponentResourceOptions, Output, Resource } from "@pulumi/pulumi";
import { tailscaleIngress } from "../network/tailscale-ingress";
import { apiextensions, core, helm } from "@pulumi/kubernetes";
import { all, ComponentResource, Config, unsecret } from "@pulumi/pulumi";
import { requireCredential } from "@root/inf/config";
import { createHash } from "node:crypto";

const appName = "couchdb";

export class CouchdbApp extends ComponentResource {
	public readonly namespaceName: Output<string>;
	public readonly chart: helm.v4.Chart;
	public readonly serviceMonitor: apiextensions.CustomResource;
	public readonly name: string = appName;
	public readonly adminPassword: Output<string>;

	// oxlint-disable-next-line max-lines-per-function -- Keep the database resources and dependencies together.
	constructor(
		tailscaleOperator: Resource,
		storage: ClusterLocalStorage,
		monitoringChart: Resource,
		options?: ComponentResourceOptions,
	) {
		super("connor-bray:infrastructure:cluster:apps:Couchdb", appName, {}, options);

		const config = new Config();
		this.adminPassword = requireCredential(config, "couchdbAdminPassword", "CouchDB");
		const cookieAuthSecret = requireCredential(
			config,
			"couchdbCookieAuthSecret",
			"CouchDB",
		);
		const erlangCookie = requireCredential(config, "couchdbErlangCookie", "CouchDB");
		const namespace = new core.v1.Namespace(
			appName,
			{ metadata: { name: appName } },
			{ parent: this },
		);
		const credentials = new core.v1.Secret(
			"couchdb-admin",
			{
				metadata: { name: "couchdb-admin", namespace: namespace.metadata.name },
				type: "Opaque",
				stringData: {
					adminUsername: "admin",
					adminPassword: this.adminPassword,
					cookieAuthSecret,
					erlangCookie,
				},
			},
			{ additionalSecretOutputs: ["data", "stringData"], parent: this },
		);
		const credentialsChecksum = unsecret(
			all([this.adminPassword, cookieAuthSecret, erlangCookie]).apply((values) =>
				createHash("sha256").update(JSON.stringify(values)).digest("hex"),
			),
		);
		this.chart = new helm.v4.Chart(
			appName,
			{
				name: appName,
				chart: "couchdb",
				version: "4.6.3",
				namespace: namespace.metadata.name,
				repositoryOpts: { repo: "https://apache.github.io/couchdb-helm" },
				values: {
					clusterSize: 1,
					allowAdminParty: false,
					createAdminSecret: false,
					extraSecretName: "couchdb-admin",
					image: { repository: "couchdb", tag: "3.5.1" },
					initImage: { repository: "busybox", tag: "1.37.0", pullPolicy: "IfNotPresent" },
					annotations: { "checksum/credentials": credentialsChecksum },
					persistentVolume: {
						enabled: true,
						size: "5Gi",
						accessModes: ["ReadWriteOnce"],
					},
					persistentVolumeClaimRetentionPolicy: {
						enabled: true,
						whenScaled: "Retain",
						whenDeleted: "Retain",
					},
					resources: {
						requests: { cpu: "100m", memory: "256Mi" },
						limits: { cpu: "500m", memory: "512Mi" },
					},
					service: {
						enabled: true,
						type: "ClusterIP",
						externalPort: 5984,
						labels: { "couchdb-monitoring": "true" },
					},
					prometheusPort: { enabled: false },
					ingress: tailscaleIngress(
						{ hostname: "couchdb", tags: ["tag:couchdb"] },
						"className",
					),
					couchdbConfig: {
						couchdb: {
							// Stable, non-secret identity for this single-node server.
							uuid: "2e810916aa1846ab8f07d4f16d79c132",
							single_node: true,
							max_document_size: 50000000,
						},
						cluster: { n: 1, q: 1 },
						chttpd: {
							bind_address: "0.0.0.0",
							require_valid_user: true,
							enable_cors: true,
							max_http_request_size: 4294967296,
						},
						chttpd_auth: { require_valid_user: true },
						httpd: { enable_cors: true },
						cors: {
							origins: "app://obsidian.md,capacitor://localhost,http://localhost",
							credentials: true,
							headers: "accept,authorization,content-type,origin,referer",
							methods: "GET,PUT,POST,HEAD,DELETE",
							max_age: 3600,
						},
					},
				},
			},
			{
				dependsOn: [
					namespace,
					credentials,
					tailscaleOperator,
					storage.chart,
					monitoringChart,
				],
				parent: this,
			},
		);
		this.serviceMonitor = new apiextensions.CustomResource(
			"couchdb-metrics",
			{
				apiVersion: "monitoring.coreos.com/v1",
				kind: "ServiceMonitor",
				metadata: {
					name: "couchdb",
					namespace: namespace.metadata.name,
					labels: { release: "kube-prometheus-stack" },
				},
				spec: {
					jobLabel: "app",
					selector: {
						matchLabels: {
							app: "couchdb",
							release: "couchdb",
							"couchdb-monitoring": "true",
						},
					},
					endpoints: [
						{
							port: "couchdb",
							path: "/_node/_local/_prometheus",
							interval: "60s",
							scrapeTimeout: "10s",
							basicAuth: {
								username: { name: "couchdb-admin", key: "adminUsername" },
								password: { name: "couchdb-admin", key: "adminPassword" },
							},
						},
					],
				},
			},
			{ dependsOn: [this.chart, monitoringChart], parent: this },
		);
		const _dashboard = new core.v1.ConfigMap(
			"couchdb-dashboard",
			{
				metadata: {
					name: "couchdb-dashboard",
					namespace: namespace.metadata.name,
					labels: { grafana_dashboard: "1" },
				},
				data: {
					"couchdb-overview.json": JSON.stringify({
						uid: "couchdb-overview",
						title: "CouchDB Overview",
						tags: ["couchdb"],
						schemaVersion: 39,
						refresh: "1m",
						time: { from: "now-1h", to: "now" },
						panels: [
							{
								title: "Scrape health",
								expr: 'up{job="couchdb"}',
								type: "stat",
								unit: "none",
							},
							{
								title: "Uptime",
								expr: 'couchdb_uptime_seconds{job="couchdb"}',
								type: "stat",
								unit: "s",
							},
							{
								title: "HTTP requests / second",
								expr: 'rate(couchdb_httpd_requests_total{job="couchdb"}[$__rate_interval])',
								type: "timeseries",
								unit: "reqps",
							},
							{
								title: "Open databases",
								expr: 'couchdb_open_databases{job="couchdb"}',
								type: "timeseries",
								unit: "none",
							},
							{
								title: "Database reads / second",
								expr: 'rate(couchdb_database_reads_total{job="couchdb"}[$__rate_interval])',
								type: "timeseries",
								unit: "ops",
							},
							{
								title: "Database writes / second",
								expr: 'rate(couchdb_database_writes_total{job="couchdb"}[$__rate_interval])',
								type: "timeseries",
								unit: "ops",
							},
						].map(({ title, expr, type, unit }, index) => ({
							id: index + 1,
							title,
							type,
							datasource: { type: "prometheus", uid: "prometheus" },
							targets: [{ refId: "A", expr, legendFormat: "{{instance}}" }],
							gridPos: { x: (index % 2) * 12, y: Math.floor(index / 2) * 8, w: 12, h: 8 },
							fieldConfig: { defaults: { unit }, overrides: [] },
						})),
					}),
				},
			},
			{ parent: this },
		);
		this.namespaceName = namespace.metadata.name;
		this.registerOutputs({
			namespaceName: this.namespaceName,
			adminPassword: this.adminPassword,
		});
	}
}
