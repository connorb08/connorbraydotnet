import type { PostgresqlConnection } from "../resources/database/types.ts";
import type { ClusterLocalStorage } from "../resources/storage.ts";
import type {
	ComponentResourceOptions,
	CustomResourceOptions,
	Output,
	ResourceTransformArgs,
	ResourceTransformResult,
} from "@pulumi/pulumi";
import { requireCredential } from "@connorbraydotnet/infrastructure/config";
import { core, helm } from "@pulumi/kubernetes";
import { ComponentResource, Config } from "@pulumi/pulumi";
import { Buffer } from "node:buffer";

const appName = "netbird";

export class NetbirdHost extends ComponentResource {
	public readonly chart: helm.v4.Chart;
	public readonly namespaceName: Output<string>;
	public readonly hostname: string;
	public readonly name: string = appName;

	constructor(
		storage: ClusterLocalStorage,
		database: PostgresqlConnection,
		options?: ComponentResourceOptions,
	) {
		super("connor-bray:infrastructure:cluster:apps:NetbirdHost", appName, {}, options);

		const config = new Config();
		// ex: netbird.connorbray.net?
		this.hostname = config.require("netbirdHostname");
		if (
			this.hostname.length > 253 ||
			!this.hostname
				.split(".")
				.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) ||
			!this.hostname.includes(".")
		) {
			throw new Error("NetBird: netbirdHostname must be a fully qualified DNS hostname.");
		}
		const encryptionKey = requireCredential(
			config,
			"netbirdEncryptionKey",
			"NetBird",
		).apply((value) => {
			const decoded = Buffer.from(value, "base64");
			if (decoded.length !== 32 || decoded.toString("base64") !== value) {
				throw new Error(
					"NetBird: netbirdEncryptionKey must be a base64-encoded 32-byte key.",
				);
			}
			return value;
		});
		const namespace = new core.v1.Namespace(
			appName,
			{
				metadata: { name: appName },
			},
			{ parent: this },
		);
		this.namespaceName = namespace.metadata.name;
		this.chart = new helm.v4.Chart(
			appName,
			{
				name: appName,
				chart: "netbird",
				version: "1.1.3",
				namespace: this.namespaceName,
				repositoryOpts: { repo: "https://repo.helmforge.dev" },
				values: {
					fullnameOverride: appName,
					server: {
						image: { repository: "netbirdio/netbird-server", tag: "0.83.1" },
						replicaCount: 1,
						// The signal client's custom gRPC dialer requires an explicit port.
						publicUrl: `https://${this.hostname}:443`,
						authSecret: requireCredential(config, "netbirdAuthSecret", "NetBird"),
						auth: { issuer: `https://${this.hostname}/oauth2` },
						store: { encryptionKey },
						service: { type: "ClusterIP" },
					},
					dashboard: {
						enabled: true,
						image: { repository: "netbirdio/dashboard", tag: "v2.97.0" },
					},
					database: {
						mode: "external",
						external: {
							engine: "postgres",
							host: database.host,
							port: database.port,
							name: database.name,
							username: database.username,
							password: database.password,
							sslMode: "require",
						},
					},
					postgresql: { enabled: false },
					persistence: {
						enabled: true,
						size: "10Gi",
						storageClass: storage.storageClassName,
					},
					ingress: { enabled: false },
				},
			},
			{
				dependsOn: [namespace, storage.chart, database.resource],
				parent: this,
				transforms: [recreateServer, replaceConfigSecret],
			},
		);

		this.registerOutputs({ namespaceName: this.namespaceName, hostname: this.hostname });
	}
}

function recreateServer(
	args: ResourceTransformArgs,
): ResourceTransformResult | undefined {
	if (
		args.type !== "kubernetes:apps/v1:Deployment" ||
		args.name !== "netbird:netbird/netbird-server"
	) {
		return undefined;
	}
	// PostgreSQL mode still keeps embedded identity state on a single-writer volume.
	return {
		props: {
			...args.props,
			spec: { ...args.props.spec, strategy: { type: "Recreate" } },
		},
		opts: args.opts,
	};
}

function replaceConfigSecret(
	args: ResourceTransformArgs,
): ResourceTransformResult | undefined {
	if (
		args.type !== "kubernetes:core/v1:Secret" ||
		args.name !== "netbird:netbird/netbird-config"
	) {
		return undefined;
	}
	const opts: CustomResourceOptions = { ...args.opts, deleteBeforeReplace: true };
	return {
		props: args.props,
		opts,
	};
}
