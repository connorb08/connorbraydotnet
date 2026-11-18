import { ComponentResource } from "@pulumi/pulumi";
import { asFunction } from "awilix/lib/resolvers.js";

export const root = asFunction(() => {
	return new ComponentResource(
		"connor-bray:infrastructure:cluster:apps:authentik:State",
		"state",
	);
}).singleton();
