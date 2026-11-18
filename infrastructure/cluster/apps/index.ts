import type { ClusterCertificateManager } from "./cert-manager";
import { ClusterGateway } from "../network/gateway";
import { PostgresqlDatabase } from "../resources/database/index";
import { ClusterLocalStorage } from "../resources/storage";
import { AuthentikApp } from "./authentik";
import { CouchdbApp } from "./couchdb";
import { MonitoringApp } from "./monitoring";
import { NetbirdHost } from "./netbird";
import { NetbirdIngress } from "./netbird-ingress";
import { ClusterTailscaleOperator } from "./tailscale";
import { VaultApp } from "./vault";
import { ComponentResource, Config, type ComponentResourceOptions } from "@pulumi/pulumi";
import { requireCredential } from "@root/inf/config";

export class ClusterApps extends ComponentResource {
	public readonly tailscale: ClusterTailscaleOperator;
	public readonly vault: VaultApp;
	public readonly storage: ClusterLocalStorage;
	public readonly couchdb: CouchdbApp;
	public readonly monitoring: MonitoringApp;
	public readonly netbird: NetbirdHost;
	public readonly netbirdIngress: NetbirdIngress;
	public readonly certificates: ClusterCertificateManager;
	public readonly postgresql: PostgresqlDatabase;
	public readonly gateway: ClusterGateway;
	public readonly authentik: AuthentikApp;
	public readonly apps: string[] = [];

	constructor(name: string, options?: ComponentResourceOptions) {
		super("connor-bray:infrastructure:cluster:apps:ClusterApps", name, {}, options);

		this.tailscale = new ClusterTailscaleOperator({ parent: this });
		this.apps.push(this.tailscale.name);
		this.storage = new ClusterLocalStorage({ parent: this });
		this.postgresql = new PostgresqlDatabase(
			this.storage,
			{
				authentik: {},
				netbird: {
					password: requireCredential(
						new Config(),
						"netbirdDatabasePassword",
						"PostgreSQL",
					),
				},
			},
			{ parent: this },
		);
		this.apps.push("postgresql");
		this.netbird = new NetbirdHost(this.storage, this.postgresql.database("netbird"), {
			parent: this,
		});
		this.netbirdIngress = new NetbirdIngress(this.netbird, this.tailscale.chart, {
			parent: this,
		});
		this.apps.push(this.netbird.name);
		this.vault = new VaultApp(this.tailscale.chart, this.storage, { parent: this });
		this.apps.push(this.vault.name);
		this.monitoring = new MonitoringApp(this.tailscale.chart, this.storage, {
			parent: this,
		});
		this.certificates = this.monitoring.certificates;
		this.gateway = new ClusterGateway(this.certificates, { parent: this });
		this.authentik = new AuthentikApp(
			this.postgresql.database("authentik"),
			this.gateway,
			{ parent: this },
		);
		this.apps.push(this.authentik.name);
		this.apps.push(this.certificates.name);
		this.apps.push(this.monitoring.name);
		this.couchdb = new CouchdbApp(
			this.tailscale.chart,
			this.storage,
			this.monitoring.chart,
			{ parent: this },
		);
		this.apps.push(this.couchdb.name);

		this.registerOutputs({
			apps: this.apps,
		});
	}
}
