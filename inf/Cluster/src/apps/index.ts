import { ClusterLocalStorage } from "../storage.ts";
import { CouchdbApp } from "./couchdb.ts";
import { MonitoringApp } from "./monitoring.ts";
import { ClusterTailscaleOperator } from "./tailscale.ts";
import { VaultApp } from "./vault.ts";
import { ComponentResource, type ComponentResourceOptions } from "@pulumi/pulumi";

export class ClusterApps extends ComponentResource {
	public readonly tailscale: ClusterTailscaleOperator;
	public readonly vault: VaultApp;
	public readonly storage: ClusterLocalStorage;
	public readonly couchdb: CouchdbApp;
	public readonly monitoring: MonitoringApp;
	public readonly apps: Set<string> = new Set<string>();

	constructor(name: string, options?: ComponentResourceOptions) {
		super("connor-bray:infrastructure:cluster:apps:ClusterApps", name, {}, options);

		this.tailscale = new ClusterTailscaleOperator({ parent: this });
		this.apps.add(this.tailscale.name);
		this.storage = new ClusterLocalStorage({ parent: this });
		this.vault = new VaultApp(this.tailscale.chart, this.storage, { parent: this });
		this.apps.add(this.vault.name);
		this.couchdb = new CouchdbApp(this.tailscale.chart, this.storage, { parent: this });
		this.apps.add(this.couchdb.name);
		this.monitoring = new MonitoringApp(this.tailscale.chart, this.storage, {
			parent: this,
		});
		this.apps.add(this.monitoring.name);

		this.registerOutputs({
			apps: this.apps,
		});
	}
}
