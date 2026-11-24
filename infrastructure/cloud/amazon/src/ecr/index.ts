import type { Cradle } from "../container";
import { ComponentResource } from "@pulumi/pulumi";
import { asFunction } from "awilix";

export const ecrRoot = asFunction(
	({ vaultUser }: Cradle) =>
		new ComponentResource(
			"connor-bray:infrastructure/aws:Ecr",
			"ecr",
			{},
			{ dependsOn: [vaultUser] },
		),
).singleton();
