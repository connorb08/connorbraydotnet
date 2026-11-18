import type { ClusterCertificateManager } from "../apps/cert-manager";
import type { ComponentResourceOptions } from "@pulumi/pulumi";
import { apiextensions, core, helm } from "@pulumi/kubernetes";
import { ComponentResource, Config, secret } from "@pulumi/pulumi";
import { TypedStackReference } from "@root/inf/stack-ref";

export class ClusterGateway extends ComponentResource {
	public readonly gateway: apiextensions.CustomResource;
	public readonly hostname: string;
	public readonly namespaceName = "envoy-gateway-system";
	public readonly name = "public";
	public readonly listenerName = "https";

	// oxlint-disable-next-line max-lines-per-function -- Keep the single-node Gateway and its TLS dependencies together.
	constructor(
		certificates: ClusterCertificateManager,
		options?: ComponentResourceOptions,
	) {
		super(
			"connor-bray:infrastructure:cluster:network:Gateway",
			"public-gateway",
			{},
			options,
		);
		const config = new Config();
		const cloudflare = new TypedStackReference<"cloudflare">(
			"cloudflare",
			{ name: config.require("cloudflareStack") },
			{ parent: this },
		);
		const dnsApiToken = secret(cloudflare.requireOutput("certManagerToken")).apply(
			(value: unknown) => {
				if (typeof value !== "string" || value.trim().length === 0) {
					throw new Error(
						"Gateway: Cloudflare stack certManagerToken must be a non-empty string.",
					);
				}
				return value;
			},
		);
		this.hostname = config.get("authentikHostname") ?? "identity.connorbray.net";
		if (
			this.hostname.length > 253 ||
			!this.hostname.includes(".") ||
			!this.hostname
				.split(".")
				.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))
		) {
			throw new Error(
				"Gateway: authentikHostname must be a fully qualified DNS hostname.",
			);
		}
		const namespace = new core.v1.Namespace(
			this.namespaceName,
			{
				metadata: {
					name: this.namespaceName,
					// Only the Envoy data plane needs hostPort on this single-node cluster.
					labels: { "pod-security.kubernetes.io/enforce": "privileged" },
				},
			},
			{ parent: this },
		);
		// Envoy's certificate-generation hooks must run before the controller starts.
		const controller = new helm.v3.Release(
			"envoy-gateway",
			{
				name: "envoy-gateway",
				namespace: namespace.metadata.name,
				chart: "oci://docker.io/envoyproxy/gateway-helm",
				version: "v1.10.0",
			},
			{ parent: this, dependsOn: [namespace] },
		);
		const apiToken = new core.v1.Secret(
			"gateway-cloudflare-dns",
			{
				metadata: { name: "cloudflare-dns", namespace: namespace.metadata.name },
				stringData: {
					"api-token": dnsApiToken,
				},
			},
			{ parent: this, additionalSecretOutputs: ["data", "stringData"] },
		);
		const issuer = new apiextensions.CustomResource(
			"gateway-letsencrypt",
			{
				apiVersion: "cert-manager.io/v1",
				kind: "Issuer",
				metadata: { name: "letsencrypt", namespace: namespace.metadata.name },
				spec: {
					acme: {
						server: "https://acme-v02.api.letsencrypt.org/directory",
						email: config.require("acmeEmail"),
						privateKeySecretRef: { name: "letsencrypt-account" },
						solvers: [
							{
								dns01: {
									cloudflare: {
										apiTokenSecretRef: { name: apiToken.metadata.name, key: "api-token" },
									},
								},
							},
						],
					},
				},
			},
			{ parent: this, dependsOn: [certificates.chart, apiToken] },
		);
		const certificate = new apiextensions.CustomResource(
			"gateway-identity-certificate",
			{
				apiVersion: "cert-manager.io/v1",
				kind: "Certificate",
				metadata: {
					name: "identity",
					namespace: namespace.metadata.name,
					annotations: { "pulumi.com/waitFor": "condition=Ready" },
				},
				spec: {
					secretName: "identity-tls",
					dnsNames: [this.hostname],
					issuerRef: { name: issuer.metadata.name, kind: "Issuer" },
				},
			},
			{ parent: this, dependsOn: [issuer] },
		);
		const proxy = new apiextensions.CustomResource(
			"public-envoy-proxy",
			{
				apiVersion: "gateway.envoyproxy.io/v1alpha1",
				kind: "EnvoyProxy",
				metadata: { name: this.name, namespace: namespace.metadata.name },
				spec: {
					provider: {
						type: "Kubernetes",
						kubernetes: {
							envoyService: { type: "ClusterIP" },
							envoyDaemonSet: {
								pod: {
									tolerations: [
										{
											key: "node-role.kubernetes.io/control-plane",
											operator: "Exists",
											effect: "NoSchedule",
										},
									],
								},
								patch: {
									type: "StrategicMerge",
									value: {
										spec: {
											template: {
												spec: {
													containers: [
														{
															name: "envoy",
															// Envoy shifts privileged listener ports by 10000.
															ports: [
																{ containerPort: 10443, hostPort: 443, protocol: "TCP" },
															],
														},
													],
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
			{ parent: this, dependsOn: [controller] },
		);
		const gatewayClass = new apiextensions.CustomResource(
			"envoy-gateway-class",
			{
				apiVersion: "gateway.networking.k8s.io/v1",
				kind: "GatewayClass",
				metadata: { name: "envoy" },
				spec: { controllerName: "gateway.envoyproxy.io/gatewayclass-controller" },
			},
			{ parent: this, dependsOn: [controller] },
		);
		this.gateway = new apiextensions.CustomResource(
			"public-gateway",
			{
				apiVersion: "gateway.networking.k8s.io/v1",
				kind: "Gateway",
				metadata: {
					name: this.name,
					namespace: namespace.metadata.name,
					annotations: { "pulumi.com/waitFor": "condition=Programmed" },
				},
				spec: {
					gatewayClassName: gatewayClass.metadata.name,
					infrastructure: {
						parametersRef: {
							group: "gateway.envoyproxy.io",
							kind: "EnvoyProxy",
							name: proxy.metadata.name,
						},
					},
					listeners: [
						{
							name: this.listenerName,
							hostname: this.hostname,
							protocol: "HTTPS",
							port: 443,
							tls: {
								mode: "Terminate",
								certificateRefs: [{ kind: "Secret", name: "identity-tls" }],
							},
							allowedRoutes: {
								namespaces: {
									from: "Selector",
									selector: {
										matchLabels: { "kubernetes.io/metadata.name": "authentik" },
									},
								},
								kinds: [{ kind: "HTTPRoute" }],
							},
						},
					],
				},
			},
			{ parent: this, dependsOn: [gatewayClass, proxy, certificate] },
		);
		this.registerOutputs({ hostname: this.hostname });
	}
}
