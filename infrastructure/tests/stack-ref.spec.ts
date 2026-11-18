import type { Output } from "@pulumi/pulumi";
import { requireRecord } from "../Cluster/src/utils.ts";
import { TypedStackReference } from "../shared/stack-ref.ts";
import { resolveOutput } from "./mock-runtime.ts";
import { isSecret, output, runtime } from "@pulumi/pulumi";
import { expect, expectTypeOf, test } from "bun:test";

test("reads typed cross-project outputs while preserving secrets and optional outputs", async () => {
	await runtime.setMocks(
		{
			newResource: (args) => {
				const inputs = requireRecord(args.inputs, "Mock inputs must be a mapping.");
				if (args.type === "pulumi:pulumi:StackReference") {
					return {
						id: args.name,
						state: {
							...inputs,
							outputs: { vpsIp: "203.0.113.42", vpsPrivateKey: "test-key" },
							secretOutputNames: ["vpsPrivateKey"],
						},
					};
				}
				return { id: args.name, state: inputs };
			},
			call: (args) => args.inputs,
		},
		"Vault",
		"test",
		false,
	);

	try {
		await runtime.runInPulumiStack(async () => {
			const amazon = new TypedStackReference<"Infrastructure">("amazon", {
				name: "organization/Infrastructure/dev",
			});
			const address = amazon.requireOutput(output("vpsIp"));
			expectTypeOf(address).toEqualTypeOf<Output<string>>();
			expectTypeOf(amazon.getOutput("vpsSshPort")).toEqualTypeOf<
				Output<number | undefined>
			>();
			expect(await resolveOutput(amazon.name)).toBe("organization/Infrastructure/dev");
			expect(await resolveOutput(address)).toBe("203.0.113.42");
			expect(await isSecret(address)).toBe(false);
			expect(await isSecret(amazon.requireOutput("vpsPrivateKey"))).toBe(true);
			expect(await resolveOutput(amazon.getOutput("vpsSshPort"))).toBeUndefined();
			return {};
		});
	} finally {
		await runtime.disconnect();
	}
});
