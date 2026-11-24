import type { ResourceTransformationArgs } from "@pulumi/pulumi";
import type { MockResourceArgs } from "@pulumi/pulumi/runtime";
import { isSecret, runtime } from "@pulumi/pulumi";
import { beforeAll, expect, test } from "bun:test";

const resources: MockResourceArgs[] = [];
const registrations: ResourceTransformationArgs[] = [];

beforeAll(async () => {
	await runtime.setMocks(
		{
			newResource: (args) => {
				resources.push(args);
				const state = { ...args.inputs };
				if (args.type === "pulumi:pulumi:StackReference") {
					state.outputs = {
						authentikUrl: "https://identity.example.com",
						donetickUrl: "https://donetick.example-tailnet.ts.net",
						donetickOidcClientId: "donetick",
						donetickOidcClientSecret: "test-donetick-secret",
						netbirdUrl: "https://netbird.example-tailnet.ts.net",
						vikunjaUrl: "https://todo.example-tailnet.ts.net",
						vikunjaOidcClientId: "vikunja",
						vikunjaOidcClientSecret: "test-vikunja-secret",
					};
					state.secretOutputNames = [
						"donetickOidcClientSecret",
						"vikunjaOidcClientSecret",
					];
				}
				if (args.type === "random:index/randomBytes:RandomBytes") {
					state.base64 = "test-netbird-secret";
				}
				return {
					id:
						args.type === "authentik:index/providerOauth2:ProviderOauth2"
							? "42"
							: args.name,
					state,
				};
			},
			call: (args) => {
				expect(args.provider).toContain("::provider::");
				if (args.token === "authentik:index/getFlow:getFlow") {
					return { ...args.inputs, id: args.inputs.slug };
				}
				if (
					args.token === "authentik:index/getCertificateKeyPair:getCertificateKeyPair"
				) {
					return { ...args.inputs, id: "signing-key" };
				}
				if (
					args.token ===
					"authentik:index/getPropertyMappingProviderScope:getPropertyMappingProviderScope"
				) {
					return { ...args.inputs, id: args.inputs.managed };
				}
				throw new Error(`Unexpected Authentik lookup: ${args.token}`);
			},
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
			expect(await isSecret(container.cradle.netbird.clientSecret)).toBe(true);
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
});

test("Authentik users use the explicit provider configured from application secrets", () => {
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

test("Donetick uses a confidential OIDC application with an exact web callback", () => {
	const oauth = resources.find(
		(resource) =>
			resource.type === "authentik:index/providerOauth2:ProviderOauth2" &&
			resource.name === "donetick",
	);
	expect(oauth?.provider).toContain("::provider::");
	expect(oauth?.inputs).toMatchObject({
		clientId: "donetick",
		clientType: "confidential",
		grantTypes: ["authorization_code", "refresh_token"],
		allowedRedirectUris: [
			{
				matching_mode: "strict",
				redirect_uri_type: "authorization",
				url: "https://donetick.example-tailnet.ts.net/auth/oauth2",
			},
		],
		propertyMappings: ["openid", "profile", "email"].map(
			(scope) => `goauthentik.io/providers/oauth2/scope-${scope}`,
		),
	});
	expect(
		resources.find(
			(resource) =>
				resource.type === "authentik:index/application:Application" &&
				resource.name === "donetick",
		)?.inputs,
	).toMatchObject({
		slug: "donetick",
		protocolProvider: 42,
	});
});

test("NetBird uses signed OIDC claims and only allows callbacks on its configured origin", () => {
	const netbird = resources.find(
		(resource) =>
			resource.type === "authentik:index/providerOauth2:ProviderOauth2" &&
			resource.name === "netbird",
	);
	expect(netbird?.inputs).toMatchObject({
		clientId: "netbird",
		clientType: "confidential",
		grantTypes: ["authorization_code", "refresh_token"],
		signingKey: "signing-key",
		includeClaimsInIdToken: true,
	});
	expect(netbird?.inputs.allowedRedirectUris).toEqual([
		{
			matching_mode: "strict",
			redirect_uri_type: "authorization",
			url: "https://netbird.example-tailnet.ts.net/oauth2/callback",
		},
		{
			matching_mode: "strict",
			redirect_uri_type: "authorization",
			url: "https://netbird.example-tailnet.ts.net/oauth2/logout/callback",
		},
	]);
});

test("Vikunja registers the exact Authentik OIDC callback with explicit provider and grants", () => {
	const oauth = resources.find(
		(resource) =>
			resource.type === "authentik:index/providerOauth2:ProviderOauth2" &&
			resource.name === "vikunja",
	);
	expect(oauth?.provider).toContain("::provider::");
	expect(oauth?.inputs).toMatchObject({
		clientId: "vikunja",
		clientType: "confidential",
		signingKey: "signing-key",
		includeClaimsInIdToken: true,
		grantTypes: ["authorization_code", "refresh_token"],
		allowedRedirectUris: [
			{
				matching_mode: "strict",
				redirect_uri_type: "authorization",
				url: "https://todo.example-tailnet.ts.net/auth/openid/authentik",
			},
		],
		propertyMappings: ["openid", "profile", "email"].map(
			(scope) => `goauthentik.io/providers/oauth2/scope-${scope}`,
		),
	});
	expect(
		resources.find(
			(resource) =>
				resource.type === "authentik:index/application:Application" &&
				resource.name === "vikunja",
		)?.inputs,
	).toMatchObject({ slug: "vikunja", protocolProvider: 42 });
});
