import type { ComponentResourceOptions } from "@pulumi/pulumi";
import { ComponentResource } from "@pulumi/pulumi";
import { approle, AuthBackend, Policy } from "@pulumi/vault";
import { readFileSync } from "node:fs";

export const proxyAuth = (options?: ComponentResourceOptions) => {
	const root = new ComponentResource(
		"connor-bray:infrastructure/vault/auth:AppRole",
		"proxy-auth",
		{},
		options,
	);
	const backend = new AuthBackend(
		"proxy-approle",
		{ type: "approle", path: "approle" },
		{ parent: root, protect: true },
	);
	const policy = new Policy(
		"devcontainer-admin",
		{
			name: "devcontainer-admin",
			policy: readFileSync(
				new URL("../../files/policies/admin.hcl", import.meta.url),
				"utf8",
			),
		},
		{ parent: root },
	);
	const role = new approle.AuthBackendRole(
		"devcontainer-admin",
		{
			backend: backend.path,
			roleName: "devcontainer-admin",
			bindSecretId: true,
			secretIdNumUses: 0,
			secretIdTtl: 86400,
			tokenPolicies: [policy.name],
			tokenType: "service",
			tokenTtl: 3600,
			tokenPeriod: 3600,
		},
		{ parent: root },
	);

	return { root, backend, policy, role };
};
