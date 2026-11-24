import type { Cradle } from "./container";
import { createOidcApplication } from "./oidc";
import { asFunction } from "awilix";

export const vikunja = asFunction(({ config, provider, root }: Cradle) =>
	createOidcApplication(
		"vikunja",
		{
			name: "Vikunja",
			clientId: config.vikunjaClientId,
			clientSecret: config.vikunjaClientSecret,
			url: config.vikunjaUrl,
			redirectUris: [
				{
					matching_mode: "strict",
					url: config.vikunjaUrl.apply((url) => `${url}/auth/openid/authentik`),
				},
			],
		},
		provider,
		root,
	),
).singleton();
