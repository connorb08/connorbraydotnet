// netbirdio/netbird terraform provider

// Authelia auth?

// ory hydra and ory kratos?

// authentik?

// authentik - Using the Gateway API

// Yes, you can map multiple domains to the same public IP address and route them to different Kubernetes services.

// vikunja

// donetick

import { IdentityProvider, Provider } from "@pulumi/netbird";
import { Config } from "@pulumi/pulumi";
import { requireCredential } from "@root/inf/config";
import { StackRef } from "@root/inf/stack-ref";

const cluster = StackRef("cluster");
const authentik = StackRef("authentik");
const managementUrl = cluster.requireOutput("netbirdUrl");
const provider = new Provider("netbird", {
	managementUrl,
	token: requireCredential(new Config("app"), "netbirdApiToken", "NetBird"),
});
const identityProvider = new IdentityProvider(
	"authentik",
	{
		name: "Authentik",
		type: "oidc",
		clientId: authentik.requireOutput("netbirdOidcClientId"),
		clientSecret: authentik.requireOutput("netbirdOidcClientSecret"),
		issuer: authentik.requireOutput("netbirdOidcIssuer"),
	},
	{ provider },
);

export const authentikIdentityProviderId = identityProvider.id;
export const authentikRedirectUrl = managementUrl.apply(
	(url) => `${url}/oauth2/callback`,
);
