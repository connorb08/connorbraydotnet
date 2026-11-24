import type { Cradle } from "./container";
import { createOidcApplication } from "./oidc";
import { asFunction } from "awilix";

export const donetick = asFunction(({ config, provider, root }: Cradle) => {
	return createOidcApplication(
		"donetick",
		{
			name: "Donetick",
			clientId: config.donetickClientId,
			clientSecret: config.donetickClientSecret,
			url: config.donetickUrl,
			redirectUris: [
				{
					matching_mode: "strict",
					url: config.donetickUrl.apply((url) => `${url}/auth/oauth2`),
				},
			],
		},
		provider,
		root,
	);
}).singleton();
