import type {
	Output,
	ResourceTransformArgs,
	ResourceTransformResult,
} from "@pulumi/pulumi";
import { isRecord, requireArray, requireRecord } from "./transforms.ts";
import { core, helm } from "@pulumi/kubernetes";
import { Config } from "@pulumi/pulumi";

export function normalizeDownwardApi(
	args: ResourceTransformArgs,
): ResourceTransformResult | undefined {
	if (args.type !== "kubernetes:apps/v1:Deployment") {
		return undefined;
	}
	const message = "Tailscale Deployment is missing its pod containers.";
	const spec = requireRecord(args.props.spec, message);
	const template = requireRecord(spec.template, message);
	const podSpec = requireRecord(template.spec, message);
	const containers = requireArray(podSpec.containers, message);
	const updatedContainers = containers.map((value) => {
		const container = requireRecord(value, "Tailscale pod containers must be mappings.");
		if (!Object.hasOwn(container, "env")) {
			return container;
		}
		const environment = requireArray(
			container.env,
			"Tailscale container environment must be a list.",
		);
		return {
			...container,
			env: environment.map((entry) => {
				const variable = requireRecord(
					entry,
					"Tailscale environment entries must be mappings.",
				);
				const valueFrom = variable.valueFrom;
				const fieldRef = isRecord(valueFrom) ? valueFrom.fieldRef : undefined;
				if (
					!(isRecord(valueFrom) && isRecord(fieldRef)) ||
					Object.hasOwn(fieldRef, "apiVersion")
				) {
					return variable;
				}
				return {
					...variable,
					valueFrom: { ...valueFrom, fieldRef: { ...fieldRef, apiVersion: "v1" } },
				};
			}),
		};
	});
	return {
		props: {
			...args.props,
			spec: {
				...spec,
				template: { ...template, spec: { ...podSpec, containers: updatedContainers } },
			},
		},
		opts: args.opts,
	};
}

function requireCredential(config: Config, key: string): Output<string> {
	return config.requireSecret(key).apply((value) => {
		if (value.trim().length === 0) {
			throw new Error(`Tailscale: ${key} must not be empty.`);
		}
		return value;
	});
}

export function createTailscale(): helm.v4.Chart {
	const config = new Config();
	const clientId = requireCredential(config, "tailscaleClientId");
	const clientSecret = requireCredential(config, "tailscaleClientSecret");
	const namespace = new core.v1.Namespace("tailscale", {
		metadata: { name: "tailscale" },
	});
	const oauthSecret = new core.v1.Secret(
		"tailscale-operator-oauth",
		{
			metadata: { name: "operator-oauth", namespace: namespace.metadata.name },
			type: "Opaque",
			stringData: { client_id: clientId, client_secret: clientSecret },
		},
		{ additionalSecretOutputs: ["data", "stringData"] },
	);
	return new helm.v4.Chart(
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
		{ dependsOn: [oauthSecret], transforms: [normalizeDownwardApi] },
	);
}
