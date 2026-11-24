import type { Provider } from "@pulumi/authentik";
import type { Input, Resource } from "@pulumi/pulumi";
import {
	Application,
	getCertificateKeyPairOutput,
	getFlowOutput,
	getPropertyMappingProviderScopeOutput,
	ProviderOauth2,
} from "@pulumi/authentik";
import { output } from "@pulumi/pulumi";

export function createOidcApplication(
	slug: string,
	args: {
		name: string;
		clientId: Input<string>;
		clientSecret: Input<string>;
		url: Input<string>;
		redirectUris: Input<Input<Record<string, Input<string>>>[]>;
	},
	provider: Provider,
	root: Resource,
): Application {
	const options = { provider, parent: root };
	const authorization = getFlowOutput(
		{ slug: "default-provider-authorization-explicit-consent" },
		options,
	);
	const invalidation = getFlowOutput(
		{ slug: "default-provider-invalidation-flow" },
		options,
	);
	const signingKey = getCertificateKeyPairOutput(
		{ name: "authentik Self-signed Certificate" },
		options,
	);
	const scopes = ["openid", "profile", "email"].map(
		(scope) =>
			getPropertyMappingProviderScopeOutput(
				{ managed: `goauthentik.io/providers/oauth2/scope-${scope}` },
				options,
			).id,
	);
	const oauth = new ProviderOauth2(
		slug,
		{
			name: args.name,
			clientId: args.clientId,
			clientSecret: args.clientSecret,
			clientType: "confidential",
			grantTypes: ["authorization_code", "refresh_token"],
			authorizationFlow: authorization.id,
			invalidationFlow: invalidation.id,
			signingKey: signingKey.id,
			includeClaimsInIdToken: true,
			propertyMappings: scopes,
			allowedRedirectUris: output(args.redirectUris).apply((uris) =>
				uris.map((uri) => ({ redirect_uri_type: "authorization", ...uri })),
			),
		},
		options,
	);
	return new Application(
		slug,
		{
			name: args.name,
			slug,
			metaLaunchUrl: args.url,
			protocolProvider: oauth.id.apply((id) => {
				const value = Number(id);
				if (!Number.isSafeInteger(value) || value <= 0) {
					throw new Error(
						`${args.name}: Authentik OAuth2 provider ID must be a positive integer.`,
					);
				}
				return value;
			}),
		},
		options,
	);
}
