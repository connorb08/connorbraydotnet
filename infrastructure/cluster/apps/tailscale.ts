import type { Output } from "@pulumi/pulumi";
import { normalizeDownwardApi } from "@connorbraydotnet/infrastructure/transforms";
import { core, helm } from "@pulumi/kubernetes";
import { ComponentResource, Config, type ComponentResourceOptions } from "@pulumi/pulumi";

const appName = "tailscale-operator";

export class ClusterTailscaleOperator extends ComponentResource {
	public readonly namespaceName: Output<string>;
	public readonly chart: helm.v4.Chart;
	public readonly name: string = appName;

	constructor(options?: ComponentResourceOptions) {
		super(
			"connor-bray:infrastructure:cluster:apps:TailscaleOperator",
			appName,
			{},
			options,
		);

		const config = new Config();
		const clientId = config.requireSecret("tailscaleClientId");
		const clientSecret = config.requireSecret("tailscaleClientSecret");

		const namespace = new core.v1.Namespace(
			"tailscale",
			{
				metadata: { name: "tailscale" },
			},
			{ parent: this },
		);
		const namespaceName = namespace.metadata.name;

		const oauthSecret = new core.v1.Secret(
			"tailscale-operator-oauth",
			{
				metadata: { name: "operator-oauth", namespace: namespaceName },
				type: "Opaque",
				stringData: { client_id: clientId, client_secret: clientSecret },
			},
			{ additionalSecretOutputs: ["data", "stringData"], parent: this },
		);

		this.chart = new helm.v4.Chart(
			"tailscale-operator",
			{
				name: "tailscale-operator",
				chart: "tailscale-operator",
				version: "1.104.4",
				namespace: "tailscale",
				repositoryOpts: { repo: "https://pkgs.tailscale.com/helmcharts" },
				values: {
					oauthSecretVolume: { secret: { secretName: "operator-oauth" } },
					operatorConfig: { defaultTags: ["tag:k8s-operator"] },
					apiServerProxyConfig: { mode: "true", allowImpersonation: "true" },
				},
			},
			{ dependsOn: [oauthSecret], transforms: [normalizeDownwardApi], parent: this },
		);

		this.namespaceName = namespaceName;
		this.registerOutputs({
			namespaceName: this.namespaceName,
		});
	}
}
