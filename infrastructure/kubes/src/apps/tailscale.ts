// import { requireCredential } from "../../../shared/config.js";
// import { core, helm } from "@pulumi/kubernetes";
// import { Config } from "@pulumi/pulumi";
// import { normalizeDownwardApi } from "@root/inf/transforms";

// export function createTailscale(): helm.v4.Chart {
// 	const config = new Config();
// 	const clientId = requireCredential(config, "tailscaleClientId", "Tailscale");
// 	const clientSecret = requireCredential(config, "tailscaleClientSecret", "Tailscale");
// 	const namespace = new core.v1.Namespace("tailscale", {
// 		metadata: { name: "tailscale" },
// 	});
// 	const oauthSecret = new core.v1.Secret(
// 		"tailscale-operator-oauth",
// 		{
// 			metadata: { name: "operator-oauth", namespace: namespace.metadata.name },
// 			type: "Opaque",
// 			stringData: { client_id: clientId, client_secret: clientSecret },
// 		},
// 		{ additionalSecretOutputs: ["data", "stringData"] },
// 	);
// 	return new helm.v4.Chart(
// 		"tailscale-operator",
// 		{
// 			name: "tailscale-operator",
// 			chart: "tailscale-operator",
// 			version: "1.104.4",
// 			namespace: "tailscale",
// 			repositoryOpts: { repo: "https://pkgs.tailscale.com/helmcharts" },
// 			values: {
// 				oauthSecretVolume: { secret: { secretName: "operator-oauth" } },
// 				operatorConfig: { defaultTags: ["tag:k8s-operator"] },
// 				apiServerProxyConfig: { mode: "true", allowImpersonation: "true" },
// 			},
// 		},
// 		{ dependsOn: [oauthSecret], transforms: [normalizeDownwardApi] },
// 	);
// }
