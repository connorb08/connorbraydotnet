import type { ClusterLocalStorage } from "../storage.ts";
import type { PostgresqlCredentials } from "./server.ts";
import type {
	ComponentResourceOptions,
	Input,
	ResourceTransformArgs,
	ResourceTransformResult,
} from "@pulumi/pulumi";
import { Chart } from "@pulumi/kubernetes/helm/v4/index.js";

export function PostgresqlCluster(
	namespace: Input<string>,
	storage: ClusterLocalStorage,
	credentials: PostgresqlCredentials[],
	options: ComponentResourceOptions,
): Chart {
	return new Chart(
		"postgresql",
		{
			name: "postgresql",
			namespace,
			chart: "cluster",
			version: "0.9.0",
			repositoryOpts: { repo: "https://cloudnative-pg.github.io/charts" },
			values: {
				fullnameOverride: "postgresql",
				type: "postgresql",
				version: { postgresql: "18" },
				backups: { enabled: false },
				cluster: {
					instances: 1,
					initdb: { encoding: "UTF8" },
					enableSuperuserAccess: false,
					storage: { size: "8Gi", storageClass: storage.storageClassName },
					resources: {
						requests: { cpu: "100m", memory: "256Mi" },
						limits: { memory: "1Gi" },
					},
					postgresql: { pg_hba: ["hostnossl all all all reject"] },
					monitoring: { enabled: false, tls: { enabled: true } },
					roles: credentials.map(({ name, secret }) => ({
						name,
						ensure: "present",
						login: true,
						superuser: false,
						createdb: false,
						createrole: false,
						passwordSecret: { name: secret.metadata.name },
					})),
				},
				databases: credentials.map(({ name }) => ({
					name,
					owner: name,
					ensure: "present",
					databaseReclaimPolicy: "retain",
				})),
			},
		},
		{ ...options, transforms: [waitForPostgresql] },
	);
}

export function waitForPostgresql(
	args: ResourceTransformArgs,
): ResourceTransformResult | undefined {
	const waitFor =
		args.type === "kubernetes:postgresql.cnpg.io/v1:Cluster"
			? "condition=Ready"
			: args.type === "kubernetes:postgresql.cnpg.io/v1:Database"
				? "jsonpath={.status.applied}=true"
				: undefined;
	if (!waitFor) {
		return undefined;
	}
	return {
		props: {
			...args.props,
			metadata: {
				...args.props.metadata,
				annotations: {
					...args.props.metadata?.annotations,
					"pulumi.com/waitFor": waitFor,
				},
			},
		},
		opts: args.opts,
	};
}
