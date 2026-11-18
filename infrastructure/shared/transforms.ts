import type {
	Output,
	ResourceTransformArgs,
	ResourceTransformResult,
} from "@pulumi/pulumi";

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
export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function requireRecord(value: unknown, message: string): Record<string, unknown> {
	if (!isRecord(value)) {
		throw new Error(message);
	}
	return value;
}

export function requireArray(value: unknown, message: string): unknown[] {
	if (!Array.isArray(value)) {
		throw new Error(message);
	}
	return value;
}

export function addPodTlsChecksum(
	args: ResourceTransformArgs,
	checksum: Output<string>,
	message: string,
): ResourceTransformResult {
	const spec = requireRecord(args.props.spec, message);
	const template = requireRecord(spec.template, message);
	const metadata = requireRecord(template.metadata, message);
	const annotations =
		metadata.annotations == null ? {} : requireRecord(metadata.annotations, message);
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
