import { isSecret, output, runtime } from "@pulumi/pulumi";
import { expect, test } from "bun:test";

// oxlint-disable-next-line max-lines-per-function
test("resolves DNS from Cloudflare and Oracle and exports a zone-scoped secret token", async () => {
	const records: Record<string, unknown>[] = [];
	const tokens: Record<string, unknown>[] = [];
	const lookups: { token: string; inputs: Record<string, unknown> }[] = [];
	await runtime.setMocks(
		{
			newResource: (args) => {
				if (args.type === "cloudflare:index/dnsRecord:DnsRecord") {
					records.push(args.inputs);
				}
				if (args.type === "pulumi:pulumi:StackReference") {
					expect(args.inputs.name).toBe("organization/Oracle/dev");
					return {
						id: args.name,
						state: { ...args.inputs, outputs: { publicIp: "203.0.113.42" } },
					};
				}
				if (args.type === "cloudflare:index/accountToken:AccountToken") {
					tokens.push(args.inputs);
					return {
						id: args.name,
						state: { ...args.inputs, value: "test-generated-token" },
					};
				}
				return { id: args.name, state: args.inputs };
			},
			call: (args) => {
				lookups.push({ token: args.token, inputs: args.inputs });
				if (args.token === "cloudflare:index/getZone:getZone") {
					const filter = args.inputs.filter;
					return {
						...args.inputs,
						id: filter.name === "bray.sh" ? "bray-zone" : "test-zone",
						account: { id: "test-account" },
					};
				}
				if (
					args.token ===
					"cloudflare:index/getAccountApiTokenPermissionGroupsList:getAccountApiTokenPermissionGroupsList"
				) {
					const name = String(args.inputs.name);
					return {
						...args.inputs,
						results: [{ id: name === "DNS Write" ? "dns-write" : "zone-read", name }],
					};
				}
				throw new Error(`Unexpected provider lookup: ${args.token}`);
			},
		},
		"Cloudflare",
		"test",
		false,
	);
	runtime.setAllConfig({
		"Cloudflare:oracleStack": "organization/Oracle/dev",
	});
	let tokenIsSecret = false;
	await runtime.runInPulumiStack(async () => {
		const dns = await import("../cloud/cloudflare/index");
		tokenIsSecret = await isSecret(dns.certManagerToken);
		return {
			hostname: output(dns.authentikHostname),
			recordId: dns.authentikRecordId,
			brayRecordIds: dns.brayRecordIds,
		};
	});
	await runtime.disconnect();
	expect(tokenIsSecret).toBe(true);
	expect(records).toHaveLength(3);
	expect(records).toEqual(
		expect.arrayContaining([
			{
				zoneId: "test-zone",
				name: "identity.connorbray.net",
				type: "A",
				content: "203.0.113.42",
				proxied: false,
				ttl: 300,
			},
			...["bray.sh", "*.bray.sh"].map((name) => ({
				zoneId: "bray-zone",
				name,
				type: "A",
				content: "203.0.113.42",
				proxied: false,
				ttl: 300,
			})),
		]),
	);
	expect(lookups).toContainEqual({
		token: "cloudflare:index/getZone:getZone",
		inputs: { filter: { name: "connorbray.net" } },
	});
	expect(lookups).toContainEqual({
		token: "cloudflare:index/getZone:getZone",
		inputs: { filter: { name: "bray.sh" } },
	});
	expect(lookups.filter((lookup) => lookup.inputs.scope)).toEqual([
		{
			token:
				"cloudflare:index/getAccountApiTokenPermissionGroupsList:getAccountApiTokenPermissionGroupsList",
			inputs: {
				accountId: "test-account",
				name: "DNS Write",
				scope: "com.cloudflare.api.account.zone",
			},
		},
		{
			token:
				"cloudflare:index/getAccountApiTokenPermissionGroupsList:getAccountApiTokenPermissionGroupsList",
			inputs: {
				accountId: "test-account",
				name: "Zone Read",
				scope: "com.cloudflare.api.account.zone",
			},
		},
	]);
	expect(tokens).toEqual([
		{
			name: "cert-manager-dns-test-zone",
			accountId: "test-account",
			policies: [
				{
					effect: "allow",
					permissionGroups: [{ id: "dns-write" }, { id: "zone-read" }],
					resources: JSON.stringify({
						"com.cloudflare.api.account.zone.test-zone": "*",
						"com.cloudflare.api.account.zone.bray-zone": "*",
					}),
				},
			],
		},
	]);
});
