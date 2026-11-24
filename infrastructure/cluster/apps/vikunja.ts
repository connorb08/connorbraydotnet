import type { PostgresqlConnection } from "../resources/database/types";
import type { ClusterLocalStorage } from "../resources/storage";
import type { networking } from "@pulumi/kubernetes";
import type { ComponentResourceOptions, Output, Resource } from "@pulumi/pulumi";
import { createTailscaleIngress } from "../network/tailscale-ingress";
import { apps, core } from "@pulumi/kubernetes";
import { all, ComponentResource, Config, output, unsecret } from "@pulumi/pulumi";
import { createNamespace, generateSecret } from "@root/inf/utils";
import { createHash } from "node:crypto";

export class VikunjaApp extends ComponentResource {
	public readonly name = "vikunja";
	public readonly clientId = "vikunja";
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
		super("connor-bray:infrastructure:cluster:apps:Vikunja", "vikunja", {}, options);
		const hostname = new Config().require("vikunjaHostname");
		if (
			hostname.length > 253 ||
			!/^todo\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.ts\.net$/.test(hostname)
		) {
			throw new Error("Vikunja: vikunjaHostname must be todo.<tailnet>.ts.net.");
		}
		this.url = output(`https://${hostname}`);
		const namespace = createNamespace(this.name, {}, { parent: this });
		const labels = { app: this.name };
		const [, , serviceSecret] = generateSecret("vikunja-service", this);
		const [, , clientSecret] = generateSecret("vikunja-oidc", this);
		this.clientSecret = clientSecret;
		const files = new core.v1.PersistentVolumeClaim(
			"vikunja-files",
			{
				metadata: { name: "vikunja-files", namespace: namespace.metadata.name },
				spec: {
					accessModes: ["ReadWriteOnce"],
					storageClassName: storage.storageClassName,
					resources: { requests: { storage: "5Gi" } },
				},
			},
			{ parent: this, protect: true, dependsOn: [storage.chart] },
		);
		const configuration = all([
			this.url,
			serviceSecret,
			clientSecret,
			database.password,
		]).apply(([url, secret, oidcSecret, password]) =>
			JSON.stringify({
				service: {
					publicurl: `${url}/`,
					secret,
					enableregistration: false,
				},
				database: {
					type: "postgres",
					host: `${database.host}:${database.port}`,
					database: database.name,
					user: database.username,
					password,
					sslmode: "require",
					maxopenconnections: 10,
					maxidleconnections: 5,
				},
				files: { basepath: "/app/vikunja/files" },
				auth: {
					local: { enabled: false },
					openid: {
						enabled: true,
						providers: {
							authentik: {
								name: "Authentik",
								authurl: `${authentikUrl}/application/o/vikunja/`,
								logouturl: `${authentikUrl}/application/o/vikunja/end-session/`,
								clientid: this.clientId,
								clientsecret: oidcSecret,
								scope: "openid profile email",
							},
						},
					},
				},
			}),
		);
		const config = new core.v1.Secret(
			"vikunja-config",
			{
				metadata: { name: "vikunja-config", namespace: namespace.metadata.name },
				stringData: { "config.yml": configuration },
			},
			{ parent: this, additionalSecretOutputs: ["data", "stringData"] },
		);
		const service = new core.v1.Service(
			this.name,
			{
				metadata: { name: this.name, namespace: namespace.metadata.name },
				spec: {
					type: "ClusterIP",
					selector: labels,
					ports: [{ name: "http", port: 3456, targetPort: "http" }],
				},
			},
			{ parent: this },
		);
		this.ingress = createTailscaleIngress(
			this.name,
			{
				hostname: "todo",
				tags: ["tag:todo"],
				metadata: { name: this.name, namespace: namespace.metadata.name },
				service: { name: service.metadata.name, port: { name: "http" } },
			},
			tailscaleOperator,
			{ parent: this },
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
									configuration.apply((value) =>
										createHash("sha256").update(value).digest("hex"),
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
									image: "vikunja/vikunja:2.8.0",
									args: ["--config", "/etc/vikunja/config.yml"],
									ports: [{ name: "http", containerPort: 3456 }],
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
										httpGet: { path: "/health", port: "http" },
										periodSeconds: 5,
										failureThreshold: 60,
									},
									readinessProbe: { httpGet: { path: "/health", port: "http" } },
									livenessProbe: {
										tcpSocket: { port: "http" },
										periodSeconds: 30,
									},
									volumeMounts: [
										{ name: "files", mountPath: "/app/vikunja/files" },
										{ name: "config", mountPath: "/etc/vikunja", readOnly: true },
										{ name: "tmp", mountPath: "/tmp" },
									],
								},
							],
							volumes: [
								{
									name: "files",
									persistentVolumeClaim: { claimName: files.metadata.name },
								},
								{ name: "config", secret: { secretName: config.metadata.name } },
								{ name: "tmp", emptyDir: {} },
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
