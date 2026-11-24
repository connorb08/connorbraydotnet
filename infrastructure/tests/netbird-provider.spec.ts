import type { MockResourceArgs } from "@pulumi/pulumi/runtime";
import { resolveOutput } from "./mock-runtime";
import { isSecret, runtime } from "@pulumi/pulumi";
import { expect, test } from "bun:test";

test("manages Authentik as an additional NetBird identity provider with an explicit admin provider", async () => {
	const resources: MockResourceArgs[] = [];
	await runtime.setMocks(
		{
			newResource: (args) => {
				resources.push(args);
				const state = { ...args.inputs };
				if (args.type === "pulumi:pulumi:StackReference") {
					if (args.inputs.name === "organization/cluster/dev") {
						state.outputs = { netbirdUrl: "https://netbird.example-tailnet.ts.net" };
						state.secretOutputNames = [];
					} else if (args.inputs.name === "organization/authentik/dev") {
						state.outputs = {
							netbirdOidcClientId: "netbird",
							netbirdOidcClientSecret: "test-client-secret",
							netbirdOidcIssuer: "https://identity.example.com/application/o/netbird/",
						};
						state.secretOutputNames = ["netbirdOidcClientSecret"];
					} else {
						throw new Error(`Unexpected stack reference: ${args.inputs.name}`);
					}
				}
				return { id: args.name, state };
			},
			call: (args) => args.inputs,
		},
		"netbird",
		"test",
		false,
	);
	runtime.setAllConfig({ "app:netbirdApiToken": "test-admin-pat" }, [
		"app:netbirdApiToken",
	]);
	try {
		await runtime.runInPulumiStack(async () => {
			const app = await import("../apps/netbird/index");
			expect(await isSecret(app.authentikRedirectUrl)).toBe(false);
			expect(await resolveOutput(app.authentikRedirectUrl)).toBe(
				"https://netbird.example-tailnet.ts.net/oauth2/callback",
			);
			return {};
		});
	} finally {
		await runtime.disconnect();
	}
	const provider = resources.find(
		(resource) => resource.type === "pulumi:providers:netbird",
	);
	expect(provider?.inputs.managementUrl).toBe("https://netbird.example-tailnet.ts.net");
	const connector = resources.find(
		(resource) => resource.type === "netbird:index/identityProvider:IdentityProvider",
	);
	expect(connector?.provider).toContain("::netbird::");
	expect(connector?.inputs).toMatchObject({
		name: "Authentik",
		type: "oidc",
		clientId: "netbird",
		issuer: "https://identity.example.com/application/o/netbird/",
	});
	expect(
		resources.filter((resource) => resource.type === "pulumi:providers:netbird"),
	).toHaveLength(1);
});
