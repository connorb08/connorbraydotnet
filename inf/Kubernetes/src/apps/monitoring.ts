import type {
	Output,
	Resource,
	ResourceTransformArgs,
	ResourceTransformResult,
} from "@pulumi/pulumi";
import { addPodTlsChecksum, requireArray, requireRecord } from "../transforms.ts";
import { core, helm } from "@pulumi/kubernetes";
import { Config, secret } from "@pulumi/pulumi";
import { PrivateKey, SelfSignedCert } from "@pulumi/tls";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

export function addAdmissionTls(
	args: ResourceTransformArgs,
	certificate: Output<string>,
): ResourceTransformResult | undefined {
	const isDeployment = args.type === "kubernetes:apps/v1:Deployment";
	const isWebhook =
		args.type ===
			"kubernetes:admissionregistration.k8s.io/v1:MutatingWebhookConfiguration" ||
		args.type ===
			"kubernetes:admissionregistration.k8s.io/v1:ValidatingWebhookConfiguration";
	if (!(isDeployment || isWebhook)) {
		return undefined;
	}
	const metadata = requireRecord(
		args.props.metadata,
		"Monitoring resource metadata is missing.",
	);
	if (
		metadata.name !==
		(isDeployment ? "kube-prometheus-stack-operator" : "kube-prometheus-stack-admission")
	) {
		return undefined;
	}
	if (isDeployment) {
		return addPodTlsChecksum(
			args,
			certificate.apply((pem) =>
				createHash("sha256").update(pem, "utf8").digest("hex").toUpperCase(),
			),
			"Monitoring operator is missing its pod template metadata or has invalid annotations.",
		);
	}
	const annotations =
		metadata.annotations == null
			? {}
			: requireRecord(
					metadata.annotations,
					"Monitoring webhook annotations must be a mapping.",
				);
	const webhooks = requireArray(
		args.props.webhooks,
		"Monitoring webhooks must be a list.",
	);
	const caBundle = certificate.apply((pem) =>
		Buffer.from(pem, "utf8").toString("base64"),
	);
	return {
		props: {
			...args.props,
			metadata: {
				...metadata,
				annotations: {
					...annotations,
					"config.kubernetes.io/depends-on":
						"apps/namespaces/monitoring/Deployment/kube-prometheus-stack-operator",
				},
			},
			webhooks: webhooks.map((entry) => {
				const webhook = requireRecord(
					entry,
					"Monitoring webhook entries must be mappings.",
				);
				const clientConfig = requireRecord(
					webhook.clientConfig,
					"Monitoring webhook client configuration is missing.",
				);
				return { ...webhook, clientConfig: { ...clientConfig, caBundle } };
			}),
		},
		opts: args.opts,
	};
}

function createAdmissionTls(namespace: core.v1.Namespace) {
	const privateKey = new PrivateKey("monitoring-admission-tls-key", {
		algorithm: "RSA",
		rsaBits: 2048,
	});
	const certificate = new SelfSignedCert("monitoring-admission-tls-cert", {
		privateKeyPem: secret(privateKey.privateKeyPem),
		isCaCertificate: true,
		subject: { commonName: "kube-prometheus-stack-operator.monitoring.svc" },
		dnsNames: [
			"kube-prometheus-stack-operator",
			"kube-prometheus-stack-operator.monitoring",
			"kube-prometheus-stack-operator.monitoring.svc",
			"kube-prometheus-stack-operator.monitoring.svc.cluster.local",
		],
		allowedUses: ["cert_signing", "key_encipherment", "digital_signature", "server_auth"],
		validityPeriodHours: 8760,
		earlyRenewalHours: 720,
	});
	const tlsSecret = new core.v1.Secret(
		"monitoring-admission-tls",
		{
			metadata: {
				name: "kube-prometheus-stack-admission",
				namespace: namespace.metadata.name,
			},
			type: "Opaque",
			stringData: {
				ca: certificate.certPem,
				cert: certificate.certPem,
				key: secret(privateKey.privateKeyPem),
			},
		},
		{ additionalSecretOutputs: ["data", "stringData"] },
	);
	return { certificate, tlsSecret };
}

function tailscaleIngress(hostname: string) {
	return {
		enabled: true,
		ingressClassName: "tailscale",
		annotations: {
			"tailscale.com/tags": "tag:monitoring",
			"tailscale.com/http-redirect": "true",
		},
		hosts: [hostname],
		paths: ["/"],
		path: "/",
		pathType: "Prefix",
		tls: [{ hosts: [hostname] }],
	};
}

export function createMonitoring(tailscaleOperator: Resource): helm.v4.Chart {
	const config = new Config();
	const adminPassword = config.requireSecret("grafanaAdminPassword").apply((value) => {
		if (value.trim().length === 0) {
			throw new Error("Monitoring: grafanaAdminPassword must not be empty.");
		}
		return value;
	});
	const namespace = new core.v1.Namespace("monitoring", {
		metadata: { name: "monitoring" },
	});
	const { certificate, tlsSecret } = createAdmissionTls(namespace);
	const adminSecret = new core.v1.Secret(
		"grafana-admin",
		{
			metadata: { name: "grafana-admin", namespace: namespace.metadata.name },
			type: "Opaque",
			stringData: { "admin-user": "admin", "admin-password": adminPassword },
		},
		{ additionalSecretOutputs: ["data", "stringData"] },
	);
	return new helm.v4.Chart(
		"kube-prometheus-stack",
		{
			name: "kube-prometheus-stack",
			chart: "kube-prometheus-stack",
			version: "93.1.0",
			namespace: "monitoring",
			repositoryOpts: { repo: "https://prometheus-community.github.io/helm-charts" },
			values: {
				prometheusOperator: {
					tls: { enabled: true },
					admissionWebhooks: {
						enabled: true,
						failurePolicy: "Fail",
						patch: { enabled: false },
						certManager: { enabled: false },
					},
				},
				grafana: {
					enabled: true,
					admin: {
						existingSecret: "grafana-admin",
						userKey: "admin-user",
						passwordKey: "admin-password",
					},
					ingress: tailscaleIngress("grafana"),
				},
				prometheus: {
					enabled: true,
					ingress: tailscaleIngress("prometheus"),
				},
			},
		},
		{
			dependsOn: [namespace, adminSecret, tlsSecret, tailscaleOperator],
			transforms: [(args) => addAdmissionTls(args, certificate.certPem)],
		},
	);
}
