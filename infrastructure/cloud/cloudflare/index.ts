import {
	AccountToken,
	DnsRecord,
	getAccountApiTokenPermissionGroupsList,
	getZone,
} from "@pulumi/cloudflare";
import { Config, secret } from "@pulumi/pulumi";
import { TypedStackReference } from "@root/inf/stack-ref";
import { isIPv4 } from "node:net";

const config = new Config();
const oracle = new TypedStackReference<"oracle">("oracle", {
	name: config.require("oracleStack"),
});
const originIpv4 = oracle.requireOutput("publicIp").apply((value: unknown) => {
	if (typeof value !== "string" || !isIPv4(value)) {
		throw new Error("Cloudflare: Oracle stack publicIp must be an IPv4 address.");
	}
	return value;
});
const domainName = config.get("domainName") ?? "connorbray.net";
export const authentikHostname =
	config.get("authentikHostname") ?? `identity.${domainName}`;
const zone = await getZone({ filter: { name: domainName } });
if (!zone.id || !zone.account.id) {
	throw new Error("Cloudflare: zone lookup must return a zone ID and account ID.");
}

const record = new DnsRecord("authentik", {
	zoneId: zone.id,
	name: authentikHostname,
	type: "A",
	content: originIpv4,
	proxied: false,
	ttl: 300,
});

const zoneScope = "com.cloudflare.api.account.zone";
const [editDns, readZone] = await Promise.all(
	["DNS Write", "Zone Read"].map((name) =>
		getAccountApiTokenPermissionGroupsList({
			accountId: zone.account.id,
			name: encodeURIComponent(name),
			scope: zoneScope,
		}),
	),
);
const editDnsId = editDns?.results.find((group) => group.name === "DNS Write")?.id;
const readZoneId = readZone?.results.find((group) => group.name === "Zone Read")?.id;

if (!editDnsId || !readZoneId) {
	throw new Error("Cloudflare: Failed to retrieve required permission group IDs.");
}

const accountToken = new AccountToken(
	"cert-manager-token",
	{
		name: `cert-manager-dns-${zone.id}`,
		accountId: zone.account.id,
		policies: [
			{
				effect: "allow",
				permissionGroups: [
					{
						id: editDnsId,
					},
					{
						id: readZoneId,
					},
				],
				resources: JSON.stringify({
					[`com.cloudflare.api.account.zone.${zone.id}`]: "*",
				}),
			},
		],
	},
	{},
);

export const authentikRecordId = record.id;
export const certManagerToken = secret(accountToken.value);
