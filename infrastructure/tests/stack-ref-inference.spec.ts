import type { Output } from "@pulumi/pulumi";
import { StackRef, type TypedStackReference } from "../shared/stack-ref";
import { isSecret, runtime } from "@pulumi/pulumi";
import { expect, expectTypeOf, test } from "bun:test";

test("infers stack outputs and resolves case-sensitive deployed project names", async () => {
	await runtime.setMocks(
		{
			newResource: (args) => ({
				id: args.name,
				state: {
					...args.inputs,
					outputs: {
						authentikUrl: "https://identity.example.com",
						couchDbAdminPassword: "test-password",
					},
					secretOutputNames: ["couchDbAdminPassword"],
				},
			}),
			call: (args) => args.inputs,
		},
		"StackRefTest",
		"test",
		false,
	);
	try {
		await runtime.runInPulumiStack(async () => {
			const cluster = StackRef("cluster");
			const custom = StackRef("cluster", "prod");
			expectTypeOf(cluster).toEqualTypeOf<TypedStackReference<"cluster">>();
			expectTypeOf(cluster.requireOutput("authentikUrl")).toEqualTypeOf<Output<string>>();
			expectTypeOf(cluster.getOutput("authentikUrl")).toEqualTypeOf<
				Output<string | undefined>
			>();

			expect(await resolveOutput(cluster.name)).toBe("organization/cluster/dev");
			expect(await resolveOutput(custom.name)).toBe("organization/cluster/prod");
			for (const [project, deployedName, stack] of [
				["aws", "Infrastructure", "dev"],
				["backend", "Backend", "prod"],
				["oracle", "Oracle", "dev"],
				["cloudflare", "Cloudflare", "dev"],
			] as const) {
				// oxlint-disable-next-line no-await-in-loop
				expect(await resolveOutput(StackRef(project, stack).name)).toBe(
					`organization/${deployedName}/${stack}`,
				);
			}
			expect(await resolveOutput(cluster.requireOutput("authentikUrl"))).toBe(
				"https://identity.example.com",
			);
			expect(await isSecret(cluster.requireOutput("couchDbAdminPassword"))).toBe(true);
			expect(
				await resolveOutput(cluster.getOutput("vaultInternalCaCert")),
			).toBeUndefined();
			return {};
		});
	} finally {
		await runtime.disconnect();
	}
});

function resolveOutput<T>(value: Output<T>): Promise<T> {
	return new Promise((resolve) => {
		value.apply((result) => {
			resolve(result);
			return result;
		});
	});
}
