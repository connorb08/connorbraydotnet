import { Config, type Input } from "@pulumi/pulumi";
import { requireCredential } from "@root/inf/config";
import { StackRef } from "@root/inf/stack-ref";
import { asFunction } from "awilix";

export interface StackConfig {
	apiKey: Input<string>;
	apiEndpoint: Input<string>;
}

export const config = asFunction((): StackConfig => {
	const cfg = new Config("app");
	const apiKey = requireCredential(cfg, "authentikApiKey", "Authentik");

	const apiEndpoint = StackRef("cluster").requireOutput("authentikUrl");

	return {
		apiKey,
		apiEndpoint,
	};
}).singleton();
