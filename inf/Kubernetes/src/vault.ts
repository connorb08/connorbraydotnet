import type {
	Output,
	Resource,
	ResourceTransformArgs,
	ResourceTransformResult,
} from "@pulumi/pulumi";
import { requireRecord } from "./transforms.ts";
import { core, helm, networking } from "@pulumi/kubernetes";
import { secret } from "@pulumi/pulumi";
import { PrivateKey, SelfSignedCert } from "@pulumi/tls";
import { createHash } from "node:crypto";

export function addTlsChecksum(
	args: ResourceTransformArgs,
	checksum: Output<string>,
): ResourceTransformResult | undefined {
	if (args.type !== "kubernetes:apps/v1:StatefulSet") {
		return undefined;
	}
	const message = "Vault StatefulSet is missing its pod template metadata.";
	const spec = requireRecord(args.props.spec, message);
	const template = requireRecord(spec.template, message);
	const metadata = requireRecord(template.metadata, message);
	const annotations =
		metadata.annotations == null
			? {}
			: requireRecord(
					metadata.annotations,
					"Vault pod template annotations must be a mapping.",
				);
	return {
		props: {
			...args.props,
			spec: {
				...spec,
				template: {
					...template,
					metadata: {
						...metadata,
						annotations: { ...annotations, "checksum/internal-tls": checksum },
					},
				},
			},
		},
		opts: args.opts,
	};
}

function createInternalTls() {
	const privateKey = new PrivateKey("vault-internal-tls-key", {
		algorithm: "RSA",
		rsaBits: 2048,
	});
	const certificate = new SelfSignedCert("vault-internal-tls-cert", {
		privateKeyPem: secret(privateKey.privateKeyPem),
		subject: { commonName: "vault.vault.svc" },
		dnsNames: [
			"localhost",
			"vault",
			"vault.vault",
			"vault.vault.svc",
			"vault.vault.svc.cluster.local",
			"vault-ui",
			"vault-ui.vault",
			"vault-ui.vault.svc",
			"vault-ui.vault.svc.cluster.local",
			"vault-internal",
			"vault-internal.vault",
			"vault-internal.vault.svc",
			"vault-internal.vault.svc.cluster.local",
			"*.vault-internal.vault.svc",
			"*.vault-internal.vault.svc.cluster.local",
		],
		ipAddresses: ["127.0.0.1", "::1"],
		allowedUses: ["key_encipherment", "digital_signature", "server_auth"],
		validityPeriodHours: 8760,
		earlyRenewalHours: 720,
	});
	return { privateKey, certificate };
}

// oxlint-disable-next-line max-lines-per-function -- Function is long but necessary for coverage.
export function createVault(tailscaleOperator: Resource): Output<string> {
	const namespace = new core.v1.Namespace("vault", {
		metadata: { name: "vault" },
	});
	const { privateKey, certificate } = createInternalTls();
	const tlsSecret = new core.v1.Secret(
		"vault-internal-tls",
		{
			metadata: { name: "vault-internal-tls", namespace: namespace.metadata.name },
			type: "kubernetes.io/tls",
			stringData: {
				"tls.crt": certificate.certPem,
				"tls.key": secret(privateKey.privateKeyPem),
				"ca.crt": certificate.certPem,
			},
		},
		{ additionalSecretOutputs: ["data", "stringData"] },
	);
	const tlsChecksum = certificate.certPem.apply((pem) =>
		createHash("sha256").update(pem, "utf8").digest("hex").toUpperCase(),
	);
	const vault = new helm.v4.Chart(
		"vault",
		{
			name: "vault",
			chart: "vault",
			namespace: "vault",
			repositoryOpts: { repo: "https://helm.releases.hashicorp.com" },
			values: {
				global: { tlsDisable: false },
				server: {
					volumes: [
						{ name: "internal-tls", secret: { secretName: "vault-internal-tls" } },
					],
					volumeMounts: [
						{
							name: "internal-tls",
							mountPath: "/vault/userconfig/internal-tls",
							readOnly: true,
						},
					],
					extraEnvironmentVars: { VAULT_CACERT: "/vault/userconfig/internal-tls/ca.crt" },
					ha: {
						enabled: true,
						replicas: 1,
						apiAddr: "https://vault.vault.svc:8200",
						disruptionBudget: { enabled: false },
						raft: {
							enabled: true,
							setNodeId: true,
							config: `ui = true
listener "tcp" {
  address = "[::]:8200"
  cluster_address = "[::]:8201"
  tls_disable = 0
  tls_cert_file = "/vault/userconfig/internal-tls/tls.crt"
  tls_key_file = "/vault/userconfig/internal-tls/tls.key"
}
storage "raft" {
  path = "/vault/data"
}
disable_mlock = true`,
						},
					},
				},
				ui: {
					enabled: true,
					serviceType: "ClusterIP",
					externalPort: 443,
					targetPort: 8200,
					annotations: { "tailscale.com/tags": "tag:vault" },
				},
			},
		},
		{ dependsOn: [tlsSecret], transforms: [(args) => addTlsChecksum(args, tlsChecksum)] },
	);
	const _ingress = new networking.v1.Ingress(
		"vault-ingress",
		{
			metadata: {
				name: "vault-secure-access",
				namespace: namespace.metadata.name,
				annotations: {
					"tailscale.com/tags": "tag:vault",
					"tailscale.com/http-redirect": "true",
				},
			},
			spec: {
				ingressClassName: "tailscale",
				tls: [{ hosts: ["vault"] }],
				rules: [
					{
						http: {
							paths: [
								{
									path: "/",
									pathType: "Prefix",
									backend: {
										service: { name: "vault-ui", port: { number: 443 } },
									},
								},
							],
						},
					},
				],
			},
		},
		{ dependsOn: [vault, tailscaleOperator] },
	);
	return certificate.certPem;
}
