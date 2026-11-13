import type { Output } from "@pulumi/pulumi";
import { core, identity } from "@pulumi/oci";
import { Config } from "@pulumi/pulumi";

interface VpsConfig {
	compartmentId: string;
	imageId: string;
	talosMachineConfig: Output<string>;
}

async function getConfiguration(): Promise<VpsConfig> {
	const config = new Config();
	const compartmentId = config.require("compartmentId");
	const imageId = config.require("talosImageId");
	const talosMachineConfig = config.requireSecret("talosMachineConfig");
	return { compartmentId, imageId, talosMachineConfig };
}

async function createNetworking({ compartmentId }: VpsConfig) {
	const vcn = new core.Vcn("default-vcn", {
		compartmentId,
		cidrBlocks: ["10.0.0.0/16"],
		displayName: "default-vcn",
		dnsLabel: "defaultvcn",
	});

	const internetGateway = new core.InternetGateway("default-internet-gateway", {
		compartmentId,
		vcnId: vcn.id,
		displayName: "default-internet-gateway",
		enabled: true,
	});

	const routeTable = new core.RouteTable("default-route-table", {
		compartmentId,
		vcnId: vcn.id,
		displayName: "default-route-table",
		routeRules: [
			{
				destination: "0.0.0.0/0",
				destinationType: "CIDR_BLOCK",
				networkEntityId: internetGateway.id,
			},
		],
	});

	const securityList = new core.SecurityList("vps-security-list", {
		compartmentId: compartmentId,
		vcnId: vcn.id,
		displayName: "vps-security-list",
		ingressSecurityRules: [
			// Allow UDP for Tailscale
			{
				protocol: "17", // UDP
				source: "0.0.0.0/0",
				udpOptions: {
					min: 41641,
					max: 41641,
				},
			},
		],
		egressSecurityRules: [
			{
				protocol: "all",
				destination: "0.0.0.0/0",
			},
		],
	});

	const subnet = new core.Subnet("default-public-subnet", {
		compartmentId,
		vcnId: vcn.id,
		cidrBlock: "10.0.1.0/24",
		displayName: "default-public-subnet",
		dnsLabel: "subnet1",
		routeTableId: routeTable.id,
		securityListIds: [securityList.id],
		prohibitPublicIpOnVnic: false,
	});

	return { vcn, internetGateway, routeTable, securityList, subnet };
}

export async function createVps(adIndex: number | undefined = 0) {
	const { compartmentId, imageId, talosMachineConfig } = await getConfiguration();
	const { subnet } = await createNetworking({
		compartmentId,
		imageId,
		talosMachineConfig,
	});

	const ads = await identity.getAvailabilityDomains({
		compartmentId: compartmentId,
	});

	const availabilityDomain = ads.availabilityDomains[adIndex]?.name;

	if (!availabilityDomain) {
		throw new Error("No availability domains found in the specified compartment.");
	}

	const instance = new core.Instance(
		"talos-vps",
		{
			compartmentId: compartmentId,
			availabilityDomain: availabilityDomain,
			displayName: "default-vps",
			shape: "VM.Standard.A1.Flex",
			shapeConfig: {
				ocpus: 2,
				memoryInGbs: 12,
			},
			launchOptions: {
				networkType: "PARAVIRTUALIZED",
				bootVolumeType: "PARAVIRTUALIZED",
				remoteDataVolumeType: "PARAVIRTUALIZED",
			},

			createVnicDetails: {
				subnetId: subnet.id,
				assignPublicIp: "true",
				displayName: "primary-vnic",
			},

			sourceDetails: {
				sourceType: "image",
				sourceId: imageId,
				bootVolumeSizeInGbs: "200",
			},

			metadata: {
				user_data: talosMachineConfig.apply((config) =>
					Buffer.from(config).toString("base64"),
				),
			},
		},
		{
			aliases: [{ name: "myVpsInstance" }],
			// Manage the running node's configuration through the Talos API.
			ignoreChanges: ["metadata.user_data"],
		},
	);

	const vpsPublicIp = instance.publicIp;
	return { instance, vpsPublicIp };
}
