import type { Input, Output, Unwrap } from "@pulumi/pulumi";
import { StackReference } from "@pulumi/pulumi";

export interface StackOutputs {
	Infrastructure: Unwrap<typeof import("../cloud/amazon/src/index.ts")>;
	Backend: Unwrap<typeof import("../backend/src/index.ts")>;
	Cluster: {
		vaultInternalCaCert: Unwrap<typeof import("../cluster/index.ts").vaultInternalCaCert>;
		// The producer exports a Set, which does not retain its type in stack state.
		createdApps: unknown;
	};
	Kubernetes: Unwrap<typeof import("../kubes/src/index.ts")>;
	Oracle: Unwrap<typeof import("../cloud/oracle/src/index.ts")>;
	Cloudflare: Unwrap<typeof import("../cloud/cloudflare/index.ts")>;
}

export class TypedStackReference<
	Project extends keyof StackOutputs,
> extends StackReference {
	public override getOutput<Key extends keyof StackOutputs[Project] & string>(
		name: Input<Key>,
	): Output<StackOutputs[Project][Key] | undefined> {
		return super.getOutput(name);
	}

	public override requireOutput<Key extends keyof StackOutputs[Project] & string>(
		name: Input<Key>,
	): Output<StackOutputs[Project][Key]> {
		return super.requireOutput(name) as Output<StackOutputs[Project][Key]>;
	}
}
