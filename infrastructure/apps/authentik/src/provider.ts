import type { Cradle } from "./container";
import { Provider } from "@pulumi/authentik";
import { asFunction } from "awilix";

export const provider = asFunction(({ config }: Cradle) => {
	return new Provider("provider", {
		token: config.apiKey,
		url: config.apiEndpoint,
	});
}).singleton();
