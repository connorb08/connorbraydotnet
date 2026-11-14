import type { Output, Resource } from "@pulumi/pulumi";
import { core, helm } from "@pulumi/kubernetes";
import { all, Config, unsecret } from "@pulumi/pulumi";
import { createHash } from "node:crypto";

function requireCredential(config: Config, key: string): Output<string> {
	return config.requireSecret(key).apply((value) => {
		if (value.trim().length === 0) {
			throw new Error(`CouchDB: ${key} must not be empty.`);
		}
		return value;
	});
}

// oxlint-disable-next-line max-lines-per-function -- Keep the database resources and dependencies together.
export function createCouchdb(tailscaleOperator: Resource): helm.v4.Chart {
	const config = new Config();
	const adminPassword = requireCredential(config, "couchdbAdminPassword");
	const cookieAuthSecret = requireCredential(config, "couchdbCookieAuthSecret");
	const erlangCookie = requireCredential(config, "couchdbErlangCookie");
	const namespace = new core.v1.Namespace("couchdb", {
		metadata: { name: "couchdb" },
	});
	const credentials = new core.v1.Secret(
		"couchdb-admin",
		{
			metadata: { name: "couchdb-admin", namespace: namespace.metadata.name },
			type: "Opaque",
			stringData: {
				adminUsername: "admin",
				adminPassword,
				cookieAuthSecret,
				erlangCookie,
			},
		},
		{ additionalSecretOutputs: ["data", "stringData"] },
	);
	const credentialsChecksum = unsecret(
		all([adminPassword, cookieAuthSecret, erlangCookie]).apply((values) =>
			createHash("sha256").update(JSON.stringify(values)).digest("hex"),
		),
	);
	return new helm.v4.Chart(
		"couchdb",
		{
			name: "couchdb",
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
				persistentVolume: { enabled: true, size: "5Gi", accessModes: ["ReadWriteOnce"] },
				persistentVolumeClaimRetentionPolicy: {
					enabled: true,
					whenScaled: "Retain",
					whenDeleted: "Retain",
				},
				resources: {
					requests: { cpu: "100m", memory: "256Mi" },
					limits: { cpu: "500m", memory: "512Mi" },
				},
				service: { enabled: true, type: "ClusterIP", externalPort: 5984 },
				ingress: {
					enabled: true,
					className: "tailscale",
					annotations: {
						"tailscale.com/tags": "tag:couchdb",
						"tailscale.com/http-redirect": "true",
					},
					hosts: ["couchdb"],
					path: "/",
					tls: [{ hosts: ["couchdb"] }],
				},
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
		{ dependsOn: [namespace, credentials, tailscaleOperator] },
	);
}
