import { Config, type Input } from "@pulumi/pulumi";
import { asFunction } from "awilix";

export interface StackConfig {
	zoneId: Input<string>;
	accountId: Input<string>;
	email: Input<string>;
}

export const config = asFunction((): StackConfig => {
	const cfg = new Config();
	return {
		zoneId: cfg.require("zoneId"),
		accountId: cfg.require("accountId"),
		email: cfg.require("email"),
	};
}).singleton();
