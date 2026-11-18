import type { NetbirdHost } from "./netbird.ts";
import type { ComponentResourceOptions, Resource } from "@pulumi/pulumi";
import { tailscaleIngress } from "../network/tailscale-ingress.ts";
import { networking } from "@pulumi/kubernetes";
import { ComponentResource } from "@pulumi/pulumi";

export class NetbirdIngress extends ComponentResource {
	public readonly ingress: networking.v1.Ingress;

	constructor(
		netbird: NetbirdHost,
		tailscaleOperator: Resource,
		options?: ComponentResourceOptions,
	) {
		super(
			"connor-bray:infrastructure:cluster:apps:NetbirdIngress",
			"netbird-ingress",
			{},
			options,
		);
		const { annotations, tls } = tailscaleIngress({
			hostname: netbird.hostname,
			tags: ["tag:netbird"],
		});
		const serverPaths = [
			"/api",
			"/oauth2",
			"/relay",
			"/ws-proxy",
			"/management.ManagementService",
			"/management.ProxyService",
			"/signalexchange.SignalExchange",
			"/.well-known/oauth-protected-resource/api/mcp",
			"/.well-known/oauth-authorization-server/api/mcp/auth",
			"/.well-known/openid-configuration/api/mcp/auth",
		];
		this.ingress = new networking.v1.Ingress(
			"netbird-ingress",
			{
				metadata: {
					name: "netbird",
					namespace: netbird.namespaceName,
					annotations,
				},
				spec: {
					ingressClassName: "tailscale",
					tls,
					rules: [
						{
							http: {
								paths: [
									...serverPaths.map((path) => ({
										path,
										pathType: "Prefix",
										backend: {
											service: { name: "netbird-server", port: { number: 80 } },
										},
									})),
									{
										path: "/",
										pathType: "Prefix",
										backend: {
											service: { name: "netbird-dashboard", port: { number: 80 } },
										},
									},
								],
							},
						},
					],
				},
			},
			{ dependsOn: [netbird.chart, tailscaleOperator], parent: this },
		);
		this.registerOutputs({});
	}
}
