import type { Cradle } from "./container";
import type { Application } from "@pulumi/authentik";
import type { Output } from "@pulumi/pulumi";
import { createOidcApplication } from "./oidc";
import { output } from "@pulumi/pulumi";
import { generateSecret } from "@root/inf/utils";
import { asFunction } from "awilix";

export interface NetbirdOidc {
	application: Application;
	clientId: string;
	clientSecret: Output<string>;
	issuer: Output<string>;
}

export const netbird = asFunction(({ config, provider, root }: Cradle): NetbirdOidc => {
	const clientId = "netbird";
	const [, , clientSecret] = generateSecret("netbird-oidc", root);
	const application = createOidcApplication(
		"netbird",
		{
			name: "NetBird",
			clientId,
			clientSecret,
			url: config.netbirdUrl,
			redirectUris: config.netbirdUrl.apply((url) => [
				{
					matching_mode: "strict",
					url: `${url}/oauth2/callback`,
				},
				{ matching_mode: "strict", url: `${url}/oauth2/logout/callback` },
			]),
		},
		provider,
		root,
	);
	return {
		application,
		clientId,
		clientSecret,
		issuer: output(config.apiEndpoint).apply((url) => `${url}/application/o/netbird/`),
	};
}).singleton();
