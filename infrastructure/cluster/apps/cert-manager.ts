import type { ComponentResourceOptions } from "@pulumi/pulumi";
import { core, helm } from "@pulumi/kubernetes";
import { ComponentResource } from "@pulumi/pulumi";

export class ClusterCertificateManager extends ComponentResource {
	public readonly chart: helm.v4.Chart;
	public readonly reloader: helm.v4.Chart;
	public readonly name = "cert-manager";

	constructor(
		monitoringNamespace: core.v1.Namespace,
		options?: ComponentResourceOptions,
	) {
		super(
			"connor-bray:infrastructure:cluster:apps:CertificateManager",
			"cert-manager",
			{},
			options,
		);
		const namespace = new core.v1.Namespace(
			"cert-manager",
			{ metadata: { name: "cert-manager" } },
			{ parent: this },
		);
		const resources = {
			requests: { cpu: "10m", memory: "32Mi" },
			limits: { cpu: "100m", memory: "128Mi" },
		};
		const crdDependencies = [
			"certificates.cert-manager.io",
			"certificaterequests.cert-manager.io",
			"issuers.cert-manager.io",
			"clusterissuers.cert-manager.io",
			"challenges.acme.cert-manager.io",
			"orders.acme.cert-manager.io",
		]
			.map((name) => `apiextensions.k8s.io/CustomResourceDefinition/${name}`)
			.join(",");
		const webhookAnnotations = {
			"pulumi.com/waitFor": "jsonpath={.webhooks[0].clientConfig.caBundle}",
			"config.kubernetes.io/depends-on": [
				"apps/namespaces/cert-manager/Deployment/cert-manager-webhook",
				"apps/namespaces/cert-manager/Deployment/cert-manager-cainjector",
			].join(","),
		};
		this.chart = new helm.v4.Chart(
			"cert-manager",
			{
				name: "cert-manager",
				chart: "cert-manager",
				version: "v1.21.3",
				repositoryOpts: { repo: "https://charts.jetstack.io" },
				namespace: namespace.metadata.name,
				values: {
					crds: { enabled: true },
					startupapicheck: { enabled: false },
					resources,
					deploymentAnnotations: { "config.kubernetes.io/depends-on": crdDependencies },
					webhook: {
						resources,
						validatingWebhookConfigurationAnnotations: webhookAnnotations,
						mutatingWebhookConfigurationAnnotations: webhookAnnotations,
					},
					cainjector: {
						resources,
						deploymentAnnotations: {
							"config.kubernetes.io/depends-on": [
								crdDependencies,
								"rbac.authorization.k8s.io/ClusterRole/cert-manager-cainjector",
								"rbac.authorization.k8s.io/ClusterRoleBinding/cert-manager-cainjector",
							].join(","),
						},
					},
				},
			},
			{ dependsOn: [namespace], parent: this },
		);
		this.reloader = new helm.v4.Chart(
			"certificate-reloader",
			{
				name: "certificate-reloader",
				chart: "reloader",
				version: "2.2.20",
				repositoryOpts: { repo: "https://stakater.github.io/stakater-charts" },
				namespace: monitoringNamespace.metadata.name,
				values: {
					reloader: {
						watchGlobally: false,
						autoReloadAll: false,
						reloadOnCreate: true,
						reloadStrategy: "annotations",
						deployment: { resources },
					},
				},
			},
			{ dependsOn: [monitoringNamespace], parent: this },
		);
		this.registerOutputs({});
	}
}
