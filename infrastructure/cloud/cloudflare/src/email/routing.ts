import type { ComponentResource } from "@pulumi/pulumi";
import { EmailRoutingRule, getZone } from "@pulumi/cloudflare";

export const createForwardRule = async (
	from: string,
	to: string,
	parent: ComponentResource,
): Promise<EmailRoutingRule> => {
	const fromDomain = from.split("@")[1];

	const zone = await getZone({
		filter: {
			match: "all",
			name: fromDomain,
		},
	});

	return new EmailRoutingRule(
		`forward-${from}-to-${to}`,
		{
			name: "forward-all",
			actions: [
				{
					type: "forward",
					values: [to],
				},
			],
			zoneId: zone.id,
			enabled: true,
			source: "api",
			matchers: [
				{
					field: "to",
					type: "literal",
					value: from,
				},
			],
		},
		{ parent },
	);
};
