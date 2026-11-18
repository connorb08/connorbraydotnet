import type { Input, Output, Unwrap } from "@pulumi/pulumi";
import { StackReference } from "@pulumi/pulumi";

export interface StackOutputs {
	backend: Unwrap<typeof import("../backend/src/index")>;
	aws: Unwrap<typeof import("../cloud/amazon/src/index")>;
	oracle: Unwrap<typeof import("../cloud/oracle/src/index")>;
	cloudflare: Unwrap<typeof import("../cloud/cloudflare/index")>;
	cluster: Unwrap<typeof import("../cluster/index")>;
}

const stackProjects = {
	backend: "Backend",
	aws: "Infrastructure",
	oracle: "Oracle",
	cloudflare: "Cloudflare",
	cluster: "Cluster",
} satisfies Record<keyof StackOutputs, string>;

const StackNameFormat = (project: keyof StackOutputs, stack = "dev") =>
	`organization/${stackProjects[project]}/${stack}`;

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
		// We know the output will match the expected type
		// oxlint-disable-next-line typescript/no-unsafe-type-assertion
		return super.requireOutput(name) as Output<StackOutputs[Project][Key]>;
	}
}

export const StackRef = <Project extends keyof StackOutputs>(
	name: Project,
	stack?: string,
) => {
	return new TypedStackReference<Project>(name, {
		name: StackNameFormat(name, stack),
	});
};
