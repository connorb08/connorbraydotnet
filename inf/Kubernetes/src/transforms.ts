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
import type {
	Output,
	ResourceTransformArgs,
	ResourceTransformResult,
} from "@pulumi/pulumi";
