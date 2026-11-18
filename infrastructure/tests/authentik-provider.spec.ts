import type { ResourceTransformationArgs } from "@pulumi/pulumi";
import type { MockResourceArgs } from "@pulumi/pulumi/runtime";
import { runtime } from "@pulumi/pulumi";
import { expect, test } from "bun:test";

test("Authentik users use the explicit provider configured from application secrets", async () => {
	const resources: MockResourceArgs[] = [];
	const registrations: ResourceTransformationArgs[] = [];
	await runtime.setMocks(
		{
			newResource: (args) => {
				resources.push(args);
				const state = { ...args.inputs };
				if (args.type === "pulumi:pulumi:StackReference") {
					state.outputs = { authentikUrl: "https://identity.example.com" };
					state.secretOutputNames = [];
				}
				return { id: args.name, state };
			},
			call: (args) => args.inputs,
		},
		"authentik",
		"test",
		false,
	);
	runtime.setAllConfig({ "app:authentikApiKey": "test-api-key" }, [
		"app:authentikApiKey",
	]);

	try {
		await runtime.runInPulumiStack(async () => {
			runtime.registerStackTransformation((args) => {
				registrations.push(args);
			});
			await import("../apps/authentik/index");
			const { container } = await import("../apps/authentik/src/container");
			const component = registrations.find(
				(args) => args.type === "connor-bray:infrastructure:cluster:apps:authentik:Users",
			);
			expect(component).toBeDefined();
			expect(component?.opts.parent).toBe(container.cradle.root);
			for (const user of registrations.filter(
				(args) => args.type === "authentik:index/user:User",
			)) {
				expect(user.opts.parent).toBe(component?.resource);
				expect(user.opts.provider).toBe(container.cradle.provider);
			}
			return {};
		});
	} finally {
		await runtime.disconnect();
	}

	const providers = resources.filter(
		(resource) => resource.type === "pulumi:providers:authentik",
	);
	expect(providers).toHaveLength(1);
	expect(providers[0]?.name).toBe("provider");
	expect(providers[0]?.inputs.url).toBe("https://identity.example.com");

	const users = resources.filter(
		(resource) => resource.type === "authentik:index/user:User",
	);
	expect(users).toHaveLength(2);
	for (const user of users) {
		expect(user.provider).toContain("::provider::");
	}
});
