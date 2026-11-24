import type { ClusterLocalStorage } from "../resources/storage";
import type { networking } from "@pulumi/kubernetes";
import type { ComponentResourceOptions, Output, Resource } from "@pulumi/pulumi";
import { createTailscaleIngress } from "../network/tailscale-ingress";
import { apps, core } from "@pulumi/kubernetes";
import { all, ComponentResource, Config, output, unsecret } from "@pulumi/pulumi";
import { createNamespace, generateSecret } from "@root/inf/utils";
import { createHash } from "node:crypto";

export class DonetickApp extends ComponentResource {
	public readonly name = "donetick";
	public readonly clientId = "donetick";
	public readonly clientSecret: Output<string>;
	public readonly url: Output<string>;
	public readonly deployment: apps.v1.Deployment;
	public readonly ingress: networking.v1.Ingress;

	// oxlint-disable-next-line max-lines-per-function -- Keep the workload and its persistent configuration together.
	constructor(
		tailscaleOperator: Resource,
		storage: ClusterLocalStorage,
		database: PostgresqlConnection,
		authentikUrl: string,
		options?: ComponentResourceOptions,
	) {
		super("connor-bray:infrastructure:cluster:apps:Donetick", "donetick", {}, options);
		const namespace = createNamespace(this.name, {}, { parent: this });
		const hostname = new Config().require("donetickHostname");
		if (
			hostname.length > 253 ||
			!/^donetick\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.ts\.net$/.test(hostname)
		) {
			throw new Error("Donetick: donetickHostname must be donetick.<tailnet>.ts.net.");
		}
		this.url = output(`https://${hostname}`);
		const labels = { app: this.name };
		const [, , jwtSecret] = generateSecret("donetick-jwt", this);
		const [, , clientSecret] = generateSecret("donetick-oidc", this);
		this.clientSecret = clientSecret;
		const data = new core.v1.PersistentVolumeClaim(
			"donetick-data",
			{
				metadata: { name: "donetick-data", namespace: namespace.metadata.name },
				spec: {
					accessModes: ["ReadWriteOnce"],
					storageClassName: storage.storageClassName,
					resources: { requests: { storage: "5Gi" } },
				},
			},
			{ parent: this, protect: true, dependsOn: [storage.chart] },
		);
		const service = new core.v1.Service(
			this.name,
			{
				metadata: { name: this.name, namespace: namespace.metadata.name },
				spec: {
					type: "ClusterIP",
					selector: labels,
					ports: [{ name: "http", port: 2021, targetPort: "http" }],
				},
			},
			{ parent: this },
		);
		this.ingress = createTailscaleIngress(
			this.name,
			{
				hostname: this.name,
				tags: ["tag:donetick"],
				metadata: { name: this.name, namespace: namespace.metadata.name },
				service: { name: service.metadata.name, port: { name: "http" } },
			},
			tailscaleOperator,
			{ parent: this },
		);
		const configuration = all([
			this.url,
			jwtSecret,
			clientSecret,
			database.password,
		]).apply(([url, jwt, oidcSecret, password]) =>
			JSON.stringify({
				name: "selfhosted",
				is_done_tick_dot_com: false,
				is_user_creation_disabled: true,
				disable_password_auth: true,
				database: {
					type: "postgres",
					host: "127.0.0.1",
					port: 5432,
					user: database.username,
					password,
					name: database.name,
					migration: true,
				},
				jwt: { secret: jwt, session_time: "168h", max_refresh: "1440h" },
				server: {
					port: 2021,
					serve_frontend: true,
					serve_swagger: false,
					public_host: url,
					cors_allow_origins: [url],
					read_timeout: "10s",
					write_timeout: "10s",
					rate_period: "60s",
					rate_limit: 300,
				},
				scheduler_jobs: { due_job: "30m", overdue_job: "3h", pre_due_job: "3h" },
				storage: { storage_type: "local", base_path: "/donetick-data/uploads" },
				email: { log_raw_url: false },
				oauth2: {
					name: "Authentik",
					client_id: this.clientId,
					client_secret: oidcSecret,
					redirect_url: `${url}/auth/oauth2`,
					scopes: ["openid", "profile", "email"],
					auth_url: `${authentikUrl}/application/o/authorize/`,
					token_url: `${authentikUrl}/application/o/token/`,
					user_info_url: `${authentikUrl}/application/o/userinfo/`,
				},
				realtime: { allowed_origins: [url] },
			}),
		);
		const configData = {
			"selfhosted.yaml": configuration,
			"pgbouncer.ini": `[databases]
${database.name} = host=${database.host} port=${database.port} dbname=${database.name}

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 5432
unix_socket_dir = /tmp
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = session
max_client_conn = 100
default_pool_size = 10
server_tls_sslmode = require
`,
			"userlist.txt": database.password.apply(
				(password) =>
					`"${database.username}" "${password.replaceAll("\\", "\\\\").replaceAll('"', '""')}"\n`,
			),
		};
		const config = new core.v1.Secret(
			"donetick-config",
			{
				metadata: { name: "donetick-config", namespace: namespace.metadata.name },
				stringData: configData,
			},
			{ parent: this, additionalSecretOutputs: ["data", "stringData"] },
		);
		this.deployment = new apps.v1.Deployment(
			this.name,
			{
				metadata: { name: this.name, namespace: namespace.metadata.name },
				spec: {
					replicas: 1,
					strategy: { type: "Recreate" },
					selector: { matchLabels: labels },
					template: {
						metadata: {
							labels,
							annotations: {
								"checksum/config": unsecret(
									output(configData).apply((value) =>
										createHash("sha256").update(JSON.stringify(value)).digest("hex"),
									),
								),
							},
						},
						spec: {
							automountServiceAccountToken: false,
							securityContext: {
								runAsNonRoot: true,
								runAsUser: 1000,
								runAsGroup: 1000,
								fsGroup: 1000,
								seccompProfile: { type: "RuntimeDefault" },
							},
							containers: [
								{
									name: this.name,
									image: "donetick/donetick:v0.1.86",
									ports: [{ name: "http", containerPort: 2021 }],
									env: [{ name: "DT_ENV", value: "selfhosted" }],
									securityContext: {
										allowPrivilegeEscalation: false,
										readOnlyRootFilesystem: true,
										capabilities: { drop: ["ALL"] },
									},
									resources: {
										requests: { cpu: "100m", memory: "128Mi" },
										limits: { cpu: "500m", memory: "512Mi" },
									},
									startupProbe: {
										httpGet: { path: "/api/v1/health", port: "http" },
										periodSeconds: 5,
										failureThreshold: 60,
									},
									readinessProbe: {
										httpGet: { path: "/api/v1/health", port: "http" },
									},
									livenessProbe: {
										httpGet: { path: "/api/v1/health", port: "http" },
										periodSeconds: 30,
									},
									volumeMounts: [
										{ name: "data", mountPath: "/donetick-data" },
										{
											name: "config",
											mountPath: "/config/selfhosted.yaml",
											subPath: "selfhosted.yaml",
											readOnly: true,
										},
										{ name: "tmp", mountPath: "/tmp" },
									],
								},
								{
									name: "pgbouncer",
									image: "edoburu/pgbouncer:v1.26.1-p0",
									command: ["/usr/bin/pgbouncer"],
									args: ["/etc/pgbouncer/pgbouncer.ini"],
									securityContext: {
										allowPrivilegeEscalation: false,
										readOnlyRootFilesystem: true,
										capabilities: { drop: ["ALL"] },
									},
									resources: {
										requests: { cpu: "10m", memory: "32Mi" },
										limits: { cpu: "100m", memory: "128Mi" },
									},
									readinessProbe: {
										exec: {
											command: [
												"pg_isready",
												"-h",
												"127.0.0.1",
												"-p",
												"5432",
												"-U",
												database.username,
												"-d",
												database.name,
											],
										},
									},
									volumeMounts: [
										{ name: "config", mountPath: "/etc/pgbouncer", readOnly: true },
										{ name: "pgbouncer-tmp", mountPath: "/tmp" },
									],
								},
							],
							volumes: [
								{
									name: "data",
									persistentVolumeClaim: { claimName: data.metadata.name },
								},
								{ name: "config", secret: { secretName: config.metadata.name } },
								{ name: "tmp", emptyDir: {} },
								{ name: "pgbouncer-tmp", emptyDir: {} },
							],
						},
					},
				},
			},
			{ parent: this, dependsOn: [database.resource] },
		);
		this.registerOutputs({ url: this.url });
	}
}
import type { PostgresqlConnection } from "../resources/database/types";
