import type { ClusterGateway } from "../network/gateway.ts";
import type { PostgresqlConnection } from "../resources/database/types.ts";
import type { ComponentResourceOptions, Output } from "@pulumi/pulumi";
import { requireCredential } from "@connorbraydotnet/infrastructure/config";
import { createNamespace, generateSecret } from "@connorbraydotnet/infrastructure/utils";
import { core, helm } from "@pulumi/kubernetes";
import { ComponentResource, Config } from "@pulumi/pulumi";

export class AuthentikApp extends ComponentResource {
	public readonly chart: helm.v4.Chart;
	public readonly secretKey: Output<string>;
	public readonly name = "authentik";

	constructor(
		database: PostgresqlConnection,
		gateway: ClusterGateway,
		options?: ComponentResourceOptions,
	) {
		super("connor-bray:infrastructure:cluster:apps:Authentik", "authentik", {}, options);
		const namespace = createNamespace(this.name, {}, { parent: this });
		const [, , secretKey] = generateSecret("authentikSecretKey", this);
		this.secretKey = secretKey;
		const bootstrap = new core.v1.Secret(
			"authentik-bootstrap",
			{
				metadata: { name: "authentik-bootstrap", namespace: namespace.metadata.name },
				stringData: {
					AUTHENTIK_BOOTSTRAP_PASSWORD: requireCredential(
						new Config(),
						"authentikBootstrapPassword",
						"Authentik",
					),
				},
			},
			{ parent: this, additionalSecretOutputs: ["data", "stringData"] },
		);
		this.chart = new helm.v4.Chart(
			this.name,
			{
				name: this.name,
				namespace: namespace.metadata.name,
				chart: "oci://ghcr.io/goauthentik/helm-charts/authentik",
				version: "2026.8.5",
				values: {
					authentik: {
						secret_key: this.secretKey,
						postgresql: {
							host: database.host,
							name: database.name,
							user: database.username,
							password: database.password,
							port: database.port,
							sslmode: "require",
						},
					},
					postgresql: { enabled: false },
					server: {
						replicas: 1,
						ingress: { enabled: false },
						route: {
							main: {
								enabled: true,
								hostnames: [gateway.hostname],
								parentRefs: [
									{
										name: gateway.name,
										namespace: gateway.namespaceName,
										sectionName: gateway.listenerName,
									},
								],
								https: false,
							},
						},
					},
					worker: {
						replicas: 1,
						envFrom: [{ secretRef: { name: bootstrap.metadata.name } }],
					},
					prometheus: { rules: { enabled: false } },
				},
			},
			{
				parent: this,
				dependsOn: [namespace, bootstrap, database.resource, gateway.gateway],
			},
		);
		this.registerOutputs({ url: `https://${gateway.hostname}` });
	}
}
