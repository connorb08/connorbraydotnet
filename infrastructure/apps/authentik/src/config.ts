import { Config, type Input, type Output } from "@pulumi/pulumi";
import { requireCredential } from "@root/inf/config";
import { StackRef } from "@root/inf/stack-ref";
import { asFunction } from "awilix";

export interface StackConfig {
	apiKey: Input<string>;
	apiEndpoint: Input<string>;
	donetickUrl: Output<string>;
	donetickClientId: Input<string>;
	donetickClientSecret: Input<string>;
	netbirdUrl: Output<string>;
	vikunjaUrl: Output<string>;
	vikunjaClientId: Input<string>;
	vikunjaClientSecret: Input<string>;
}

export const config = asFunction((): StackConfig => {
	const cfg = new Config("app");
	const apiKey = requireCredential(cfg, "authentikApiKey", "Authentik");
	const cluster = StackRef("cluster");
	const apiEndpoint = cluster.requireOutput("authentikUrl");

	return {
		apiKey,
		apiEndpoint,
		donetickUrl: cluster.requireOutput("donetickUrl"),
		donetickClientId: cluster.requireOutput("donetickOidcClientId"),
		donetickClientSecret: cluster.requireOutput("donetickOidcClientSecret"),
		netbirdUrl: cluster.requireOutput("netbirdUrl"),
		vikunjaUrl: cluster.requireOutput("vikunjaUrl"),
		vikunjaClientId: cluster.requireOutput("vikunjaOidcClientId"),
		vikunjaClientSecret: cluster.requireOutput("vikunjaOidcClientSecret"),
	};
}).singleton();
