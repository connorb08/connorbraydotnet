import type { ClusterCertificateManager } from "./cert-manager.ts";
import { ClusterLocalStorage } from "../storage.ts";
import { CouchdbApp } from "./couchdb.ts";
import { MonitoringApp } from "./monitoring.ts";
import { NetbirdIngress } from "./netbird-ingress.ts";
import { NetbirdHost } from "./netbird.ts";
import { ClusterTailscaleOperator } from "./tailscale.ts";
import { VaultApp } from "./vault.ts";
import { ComponentResource, type ComponentResourceOptions } from "@pulumi/pulumi";

export class ClusterApps extends ComponentResource {
	public readonly tailscale: ClusterTailscaleOperator;
	public readonly vault: VaultApp;
	public readonly storage: ClusterLocalStorage;
	public readonly couchdb: CouchdbApp;
	public readonly monitoring: MonitoringApp;
	public readonly netbird: NetbirdHost;
	public readonly netbirdIngress: NetbirdIngress;
	public readonly certificates: ClusterCertificateManager;
	public readonly apps: Set<string> = new Set<string>();

	constructor(name: string, options?: ComponentResourceOptions) {
		super("connor-bray:infrastructure:cluster:apps:ClusterApps", name, {}, options);

		this.tailscale = new ClusterTailscaleOperator({ parent: this });
		this.apps.add(this.tailscale.name);
		this.storage = new ClusterLocalStorage({ parent: this });
		this.netbird = new NetbirdHost(this.storage, { parent: this });
		this.netbirdIngress = new NetbirdIngress(this.netbird, this.tailscale.chart, {
			parent: this,
		});
		this.apps.add(this.netbird.name);
		this.vault = new VaultApp(this.tailscale.chart, this.storage, { parent: this });
		this.apps.add(this.vault.name);
		this.monitoring = new MonitoringApp(this.tailscale.chart, this.storage, {
			parent: this,
		});
		this.certificates = this.monitoring.certificates;
		this.apps.add(this.certificates.name);
		this.apps.add(this.monitoring.name);
		this.couchdb = new CouchdbApp(
			this.tailscale.chart,
			this.storage,
			this.monitoring.chart,
			{ parent: this },
		);
		this.apps.add(this.couchdb.name);

		this.registerOutputs({
			apps: this.apps,
		});
	}
}
