import type { types } from "@pulumi/kubernetes";
import type { CustomResourceOptions, Resource } from "@pulumi/pulumi";
import { networking } from "@pulumi/kubernetes";
import { output } from "@pulumi/pulumi";

interface TailscaleIngressOptions {
	hostname: string;
	tags: readonly string[];
}

interface TailscaleIngressArgs extends TailscaleIngressOptions {
	metadata: types.input.meta.v1.ObjectMeta;
	service: types.input.networking.v1.IngressServiceBackend;
}

function tailscaleAnnotations(tags: readonly string[]) {
	return {
		"tailscale.com/tags": tags.join(","),
		"tailscale.com/http-redirect": "true",
	};
}

export function tailscaleIngress(
	{ hostname, tags }: TailscaleIngressOptions,
	classNameKey: "ingressClassName" | "className" = "ingressClassName",
) {
	return {
		enabled: true,
		[classNameKey]: "tailscale",
		annotations: tailscaleAnnotations(tags),
		hosts: [hostname],
		paths: ["/"],
		path: "/",
		pathType: "Prefix",
		tls: [{ hosts: [hostname] }],
	};
}

export function createTailscaleIngress(
	name: string,
	{ hostname, tags, metadata, service }: TailscaleIngressArgs,
	operator: Resource,
	options?: CustomResourceOptions,
): networking.v1.Ingress {
	return new networking.v1.Ingress(
		name,
		{
			metadata: {
				...metadata,
				annotations: output(metadata.annotations ?? {}).apply((annotations) => ({
					...annotations,
					...tailscaleAnnotations(tags),
				})),
			},
			spec: {
				ingressClassName: "tailscale",
				tls: [{ hosts: [hostname] }],
				rules: [
					{
						http: {
							paths: [{ path: "/", pathType: "Prefix", backend: { service } }],
						},
					},
				],
			},
		},
		{
			...options,
			dependsOn: output(options?.dependsOn ?? []).apply((dependencies) => [
				...(Array.isArray(dependencies) ? dependencies : [dependencies]),
				operator,
			]),
		},
	);
}
