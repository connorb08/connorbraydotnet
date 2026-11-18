import type { ClusterLocalStorage } from "../storage";
import type { PostgresqlApplicationConfig, PostgresqlConnection } from "./types";
import type { ComponentResourceOptions } from "@pulumi/pulumi";
import { PostgresqlCluster } from "./cluster";
import { PostgresqlOperator } from "./operator";
import { createDatabaseCredentials } from "./server";
import { ComponentResource } from "@pulumi/pulumi";
import { createNamespace } from "@root/inf/utils";

export class PostgresqlDatabase extends ComponentResource {
	public readonly chart: ReturnType<typeof PostgresqlCluster>;
	public readonly host = "postgresql-rw.postgresql.svc.cluster.local";
	public readonly port = 5432;
	private readonly connections = new Map<string, PostgresqlConnection>();

	constructor(
		storage: ClusterLocalStorage,
		applications: Record<string, PostgresqlApplicationConfig>,
		options?: ComponentResourceOptions,
	) {
		super(
			"connor-bray:infrastructure:cluster:resources:database:Postgresql",
			"postgresql",
			{},
			options,
		);
		const childOptions = { parent: this };
		const namespace = createNamespace("postgresql", {}, childOptions);
		const operator = PostgresqlOperator({ options: childOptions });
		const credentials = Object.entries(applications).map(([name, config]) => {
			if (
				!/^[a-z][a-z0-9]{0,47}$/.test(name) ||
				["postgres", "template0", "template1", "app"].includes(name) ||
				name.startsWith("pg_")
			) {
				throw new Error(
					`PostgreSQL: invalid or reserved application database name: ${name}`,
				);
			}
			return createDatabaseCredentials(
				name,
				namespace.metadata.name,
				config,
				childOptions,
			);
		});
		this.chart = PostgresqlCluster(namespace.metadata.name, storage, credentials, {
			parent: this,
			dependsOn: [
				operator.chart,
				storage.chart,
				namespace,
				...credentials.map((entry) => entry.secret),
			],
		});
		for (const { name, password } of credentials) {
			this.connections.set(name, {
				host: this.host,
				port: this.port,
				name,
				username: name,
				password,
				resource: this.chart,
			});
		}
		this.registerOutputs({
			host: this.host,
			port: this.port,
			databases: [...this.connections.keys()],
		});
	}

	public database(name: string): PostgresqlConnection {
		const connection = this.connections.get(name);
		if (!connection) {
			throw new Error(`PostgreSQL: database ${name} has not been provisioned.`);
		}
		return connection;
	}
}
