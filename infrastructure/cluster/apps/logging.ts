import type { ClusterLocalStorage } from "#storage";
import type { ClusterCertificateManager } from "./cert-manager";
import type { types } from "@pulumi/kubernetes";
import type { ComponentResourceOptions } from "@pulumi/pulumi";
import { apiextensions, core, helm, rbac } from "@pulumi/kubernetes";
import { ComponentResource } from "@pulumi/pulumi";

const nginxImage = "nginxinc/nginx-unprivileged:1.29-alpine";
const grafanaTlsSecret = "grafana-loki-client-tls";
const alloyTlsSecret = "alloy-loki-client-tls";
const lokiTlsSecret = "loki-server-tls";

export class LoggingApp extends ComponentResource {
	public readonly loki: helm.v4.Chart;
	public readonly alloy: helm.v4.Chart;
	public readonly grafanaCertificate: apiextensions.CustomResource;
	public readonly grafanaProxy: types.input.core.v1.Container;
	public readonly grafanaVolumes: types.input.core.v1.Volume[];
	public readonly grafanaTlsSecretName = grafanaTlsSecret;

	// oxlint-disable-next-line max-lines-per-function -- Keep the logging resources and their TLS dependencies together.
	constructor(
		namespace: core.v1.Namespace,
		storage: ClusterLocalStorage,
		certificates: ClusterCertificateManager,
		options?: ComponentResourceOptions,
	) {
		super("connor-bray:infrastructure:cluster:apps:Logging", "logging", {}, options);
		const namespaceName = namespace.metadata.name;
		const selfSignedIssuer = new apiextensions.CustomResource(
			"logging-selfsigned",
			{
				apiVersion: "cert-manager.io/v1",
				kind: "Issuer",
				metadata: {
					name: "logging-selfsigned",
					namespace: namespaceName,
					annotations: { "pulumi.com/waitFor": "condition=Ready" },
				},
				spec: { selfSigned: {} },
			},
			{ dependsOn: [namespace, certificates.chart], parent: this },
		);
		const ca = new apiextensions.CustomResource(
			"logging-ca",
			{
				apiVersion: "cert-manager.io/v1",
				kind: "Certificate",
				metadata: {
					name: "logging-ca",
					namespace: namespaceName,
					annotations: { "pulumi.com/waitFor": "condition=Ready" },
				},
				spec: {
					secretName: "logging-ca",
					commonName: "cluster-logging-ca",
					isCA: true,
					duration: "87600h",
					renewBefore: "17520h",
					// A stable CA key keeps old and new certificates interoperable during renewal.
					privateKey: { algorithm: "ECDSA", size: 256, rotationPolicy: "Never" },
					usages: ["cert sign", "crl sign"],
					issuerRef: { name: "logging-selfsigned", kind: "Issuer" },
				},
			},
			{ dependsOn: [selfSignedIssuer], parent: this },
		);
		const issuer = new apiextensions.CustomResource(
			"logging-ca-issuer",
			{
				apiVersion: "cert-manager.io/v1",
				kind: "Issuer",
				metadata: {
					name: "logging-ca",
					namespace: namespaceName,
					annotations: { "pulumi.com/waitFor": "condition=Ready" },
				},
				spec: { ca: { secretName: "logging-ca" } },
			},
			{ dependsOn: [ca], parent: this },
		);
		const serverCertificate = createCertificate(
			lokiTlsSecret,
			{
				commonName: "loki.monitoring.svc",
				dnsNames: [
					"loki",
					"loki.monitoring",
					"loki.monitoring.svc",
					"loki.monitoring.svc.cluster.local",
				],
				usages: ["digital signature", "server auth"],
			},
			namespace,
			issuer,
			this,
		);
		const alloyCertificate = createCertificate(
			alloyTlsSecret,
			{ commonName: "alloy", usages: ["digital signature", "client auth"] },
			namespace,
			issuer,
			this,
		);
		this.grafanaCertificate = createCertificate(
			grafanaTlsSecret,
			{ commonName: "grafana", usages: ["digital signature", "client auth"] },
			namespace,
			issuer,
			this,
		);
		const healthConfig = new core.v1.ConfigMap(
			"loki-health-proxy",
			{
				metadata: { name: "loki-health-proxy", namespace: namespaceName },
				data: {
					"nginx.conf": `worker_processes 1;
error_log /dev/stderr warn;
pid /tmp/nginx.pid;
events { worker_connections 64; }
http {
  access_log off;
  client_body_temp_path /tmp/client;
  proxy_temp_path /tmp/proxy;
  fastcgi_temp_path /tmp/fastcgi;
  uwsgi_temp_path /tmp/uwsgi;
  scgi_temp_path /tmp/scgi;
  server {
    listen 3102;
    location = /ready { proxy_pass http://127.0.0.1:3101/ready; }
    location / { return 404; }
  }
}`,
				},
			},
			{ parent: this },
		);
		this.loki = new helm.v4.Chart(
			"loki",
			{
				name: "loki",
				chart: "loki",
				version: "7.6.0",
				namespace: namespaceName,
				repositoryOpts: { repo: "https://grafana.github.io/helm-charts" },
				values: {
					fullnameOverride: "loki",
					deploymentMode: "SingleBinary",
					gateway: { enabled: false },
					read: { replicas: 0 },
					write: { replicas: 0 },
					backend: { replicas: 0 },
					chunksCache: { enabled: false },
					resultsCache: { enabled: false },
					lokiCanary: { enabled: false },
					test: { enabled: false },
					sidecar: { rules: { enabled: false } },
					rbac: { namespaced: true },
					serviceAccount: { automountServiceAccountToken: false },
					ruler: { enabled: false },
					loki: {
						image: { tag: "3.6.18" },
						auth_enabled: false,
						commonConfig: { replication_factor: 1 },
						storage: { type: "filesystem" },
						schemaConfig: {
							configs: [
								{
									from: "2024-04-01",
									store: "tsdb",
									object_store: "filesystem",
									schema: "v13",
									index: { prefix: "index_", period: "24h" },
								},
							],
						},
						readinessProbe: { httpGet: { path: "/ready", port: 3102 } },
						structuredConfig: {
							server: {
								http_listen_port: 3100,
								grpc_listen_address: "127.0.0.1",
								http_tls_config: {
									cert_file: "/etc/loki/tls/tls.crt",
									key_file: "/etc/loki/tls/tls.key",
									client_ca_file: "/etc/loki/tls/ca.crt",
									client_auth_type: "RequireAndVerifyClientCert",
								},
							},
							internal_server: {
								enable: true,
								http_listen_address: "127.0.0.1",
								http_listen_port: 3101,
							},
							common: {
								instance_addr: "127.0.0.1",
								ring: { kvstore: { store: "inmemory" } },
							},
							memberlist: { bind_addr: ["127.0.0.1"], join_members: [] },
							limits_config: { retention_period: "168h", volume_enabled: true },
							compactor: {
								working_directory: "/var/loki/compactor",
								retention_enabled: true,
								delete_request_store: "filesystem",
							},
							analytics: { reporting_enabled: false },
						},
					},
					singleBinary: {
						replicas: 1,
						annotations: {
							"secret.reloader.stakater.com/reload": lokiTlsSecret,
							"configmap.reloader.stakater.com/reload": "loki-health-proxy",
						},
						persistence: {
							enabled: true,
							size: "5Gi",
							whenDeleted: "Retain",
							whenScaled: "Retain",
						},
						resources: {
							requests: { cpu: "100m", memory: "256Mi" },
							limits: { cpu: "500m", memory: "1Gi" },
						},
						extraVolumes: [
							{ name: "logging-tls", secret: { secretName: lokiTlsSecret } },
							{ name: "health-config", configMap: { name: healthConfig.metadata.name } },
							{ name: "health-tmp", emptyDir: {} },
						],
						extraVolumeMounts: [
							{ name: "logging-tls", mountPath: "/etc/loki/tls", readOnly: true },
						],
						extraContainers: [
							{
								name: "health-proxy",
								image: nginxImage,
								command: ["nginx", "-g", "daemon off;"],
								volumeMounts: [
									{
										name: "health-config",
										mountPath: "/etc/nginx/nginx.conf",
										subPath: "nginx.conf",
										readOnly: true,
									},
									{ name: "health-tmp", mountPath: "/tmp" },
								],
								resources: {
									requests: { cpu: "5m", memory: "16Mi" },
									limits: { cpu: "50m", memory: "64Mi" },
								},
							},
						],
					},
				},
			},
			{
				dependsOn: [
					namespace,
					storage.chart,
					serverCertificate,
					healthConfig,
					certificates.reloader,
				],
				parent: this,
			},
		);
		const logReader = new rbac.v1.ClusterRole(
			"alloy-logs",
			{
				metadata: { name: "alloy-logs" },
				rules: [
					{
						apiGroups: [""],
						resources: ["pods", "pods/log", "namespaces"],
						verbs: ["get", "list", "watch"],
					},
				],
			},
			{ parent: this },
		);
		const logAccess = new rbac.v1.ClusterRoleBinding(
			"alloy-logs",
			{
				metadata: { name: "alloy-logs" },
				roleRef: {
					apiGroup: "rbac.authorization.k8s.io",
					kind: "ClusterRole",
					name: logReader.metadata.name,
				},
				subjects: [{ kind: "ServiceAccount", name: "alloy", namespace: namespaceName }],
			},
			{ parent: this },
		);
		this.alloy = new helm.v4.Chart(
			"alloy",
			{
				name: "alloy",
				chart: "alloy",
				version: "1.16.0",
				namespace: namespaceName,
				repositoryOpts: { repo: "https://grafana.github.io/helm-charts" },
				values: {
					fullnameOverride: "alloy",
					crds: { create: false },
					rbac: { create: false },
					controller: {
						type: "daemonset",
						extraAnnotations: { "secret.reloader.stakater.com/reload": alloyTlsSecret },
						tolerations: [{ operator: "Exists" }],
						volumes: {
							extra: [{ name: "logging-tls", secret: { secretName: alloyTlsSecret } }],
						},
					},
					alloy: {
						enableReporting: false,
						extraEnv: [
							{
								name: "NODE_NAME",
								valueFrom: { fieldRef: { apiVersion: "v1", fieldPath: "spec.nodeName" } },
							},
						],
						mounts: {
							extra: [
								{ name: "logging-tls", mountPath: "/etc/alloy/tls", readOnly: true },
							],
						},
						resources: {
							requests: { cpu: "50m", memory: "128Mi" },
							limits: { cpu: "250m", memory: "512Mi" },
						},
						configMap: { content: alloyConfig },
					},
				},
			},
			{ dependsOn: [this.loki, alloyCertificate, logAccess], parent: this },
		);
		const proxyConfig = new core.v1.ConfigMap(
			"grafana-loki-proxy",
			{
				metadata: { name: "grafana-loki-proxy", namespace: namespaceName },
				data: {
					"nginx.conf": `worker_processes 1;
error_log /dev/stderr warn;
pid /tmp/nginx.pid;
events { worker_connections 256; }
http {
  access_log off;
  client_body_temp_path /tmp/client;
  proxy_temp_path /tmp/proxy;
  fastcgi_temp_path /tmp/fastcgi;
  uwsgi_temp_path /tmp/uwsgi;
  scgi_temp_path /tmp/scgi;
  server {
    listen 127.0.0.1:13100;
    location / {
      proxy_pass https://loki.monitoring.svc:3100;
      proxy_set_header X-Scope-OrgID fake;
      proxy_ssl_server_name on;
      proxy_ssl_name loki.monitoring.svc;
      proxy_ssl_verify on;
      proxy_ssl_trusted_certificate /etc/loki-client/ca.crt;
      proxy_ssl_certificate /etc/loki-client/tls.crt;
      proxy_ssl_certificate_key /etc/loki-client/tls.key;
      proxy_read_timeout 120s;
    }
  }
}`,
				},
			},
			{ parent: this },
		);
		this.grafanaVolumes = [
			{ name: "loki-client-tls", secret: { secretName: grafanaTlsSecret } },
			{ name: "loki-proxy-config", configMap: { name: proxyConfig.metadata.name } },
			{ name: "loki-proxy-tmp", emptyDir: {} },
		];
		this.grafanaProxy = {
			name: "loki-tls-proxy",
			image: nginxImage,
			command: ["nginx", "-g", "daemon off;"],
			volumeMounts: [
				{ name: "loki-client-tls", mountPath: "/etc/loki-client", readOnly: true },
				{
					name: "loki-proxy-config",
					mountPath: "/etc/nginx/nginx.conf",
					subPath: "nginx.conf",
					readOnly: true,
				},
				{ name: "loki-proxy-tmp", mountPath: "/tmp" },
			],
			resources: {
				requests: { cpu: "5m", memory: "16Mi" },
				limits: { cpu: "100m", memory: "64Mi" },
			},
		};
		this.registerOutputs({});
	}
}

function createCertificate(
	name: string,
	identity: { commonName: string; dnsNames?: string[]; usages: string[] },
	namespace: core.v1.Namespace,
	issuer: apiextensions.CustomResource,
	parent: ComponentResource,
) {
	return new apiextensions.CustomResource(
		name,
		{
			apiVersion: "cert-manager.io/v1",
			kind: "Certificate",
			metadata: {
				name,
				namespace: namespace.metadata.name,
				annotations: { "pulumi.com/waitFor": "condition=Ready" },
			},
			spec: {
				secretName: name,
				...identity,
				duration: "8760h",
				renewBefore: "720h",
				privateKey: { algorithm: "ECDSA", size: 256, rotationPolicy: "Always" },
				issuerRef: { name: "logging-ca", kind: "Issuer" },
			},
		},
		{ dependsOn: [issuer], parent },
	);
}

const alloyConfig = `logging {
  level = "info"
}
discovery.kubernetes "pods" {
  role = "pod"
  selectors {
    role = "pod"
    field = "spec.nodeName=" + sys.env("NODE_NAME")
  }
}
discovery.relabel "pod_logs" {
  targets = discovery.kubernetes.pods.targets
  rule {
    source_labels = ["__meta_kubernetes_namespace"]
    target_label = "namespace"
  }
  rule {
    source_labels = ["__meta_kubernetes_pod_name"]
    target_label = "pod"
  }
  rule {
    source_labels = ["__meta_kubernetes_pod_container_name"]
    target_label = "container"
  }
  rule {
    source_labels = ["__meta_kubernetes_pod_node_name"]
    target_label = "node"
  }
}
loki.source.kubernetes "pods" {
  targets = discovery.relabel.pod_logs.output
  forward_to = [loki.write.local.receiver]
}
loki.write "local" {
  endpoint {
    url = "https://loki.monitoring.svc:3100/loki/api/v1/push"
    tls_config {
      ca_file = "/etc/alloy/tls/ca.crt"
      cert_file = "/etc/alloy/tls/tls.crt"
      key_file = "/etc/alloy/tls/tls.key"
      server_name = "loki.monitoring.svc"
    }
  }
}`;
