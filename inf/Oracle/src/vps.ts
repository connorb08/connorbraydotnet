// import { core, identity } from "@pulumi/oci";
// import { Config } from "@pulumi/pulumi";

// export function createVps() {
// 	const config = new Config();
// 	const compartmentId = config.require("oci:compartmentId");

// 	// 1. Existing VCN Infrastructure
// 	const vcn = new core.Vcn("myVcn", {
// 		compartmentId: compartmentId,
// 		cidrBlocks: ["10.0.0.0/16"],
// 		displayName: "my-pulumi-vcn",
// 		dnsLabel: "myvcn",
// 	});

// 	const internetGateway = new core.InternetGateway("myInternetGateway", {
// 		compartmentId: compartmentId,
// 		vcnId: vcn.id,
// 		displayName: "my-internet-gateway",
// 		enabled: true,
// 	});

// 	const routeTable = new core.RouteTable("myRouteTable", {
// 		compartmentId: compartmentId,
// 		vcnId: vcn.id,
// 		displayName: "my-route-table",
// 		routeRules: [
// 			{
// 				destination: "0.0.0.0/0",
// 				destinationType: "CIDR_BLOCK",
// 				networkEntityId: internetGateway.id,
// 			},
// 		],
// 	});

// 	// 2. Open Port 22 (SSH) via Security List
// 	const securityList = new core.SecurityList("mySecurityList", {
// 		compartmentId: compartmentId,
// 		vcnId: vcn.id,
// 		displayName: "my-security-list",
// 		ingressSecurityRules: [
// 			{
// 				protocol: "6", // TCP
// 				source: "0.0.0.0/0",
// 				tcpOptions: {
// 					min: 22,
// 					max: 22,
// 				},
// 			},
// 		],
// 		egressSecurityRules: [
// 			{
// 				protocol: "all",
// 				destination: "0.0.0.0/0",
// 			},
// 		],
// 	});

// 	const subnet = new core.Subnet("mySubnet", {
// 		compartmentId: compartmentId,
// 		vcnId: vcn.id,
// 		cidrBlock: "10.0.1.0/24",
// 		displayName: "my-public-subnet",
// 		dnsLabel: "subnet1",
// 		routeTableId: routeTable.id,
// 		securityListIds: [securityList.id],
// 		prohibitPublicIpOnVnic: false,
// 	});

// 	// 3. Fetch Availability Domains for Placement
// 	const ads = identity.getAvailabilityDomains({
// 		compartmentId: compartmentId,
// 	});

// 	// 4. Look up a Standard Ubuntu Minimal Image (or pass a direct OCID)
// 	const ubuntuImage = core.getImages({
// 		compartmentId: compartmentId,
// 		operatingSystem: "Canonical Ubuntu",
// 		operatingSystemVersion: "22.04 Minimal",
// 	});

// 	// 5. Provide your SSH Public Key string
// 	const sshPublicKey = `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQD... your-key-here`;

// 	// 6. Launch the VPS (Compute Instance)
// 	const instance = new core.Instance("myVpsInstance", {
// 		compartmentId: compartmentId,
// 		// Pick the first available availability domain in your region
// 		availabilityDomain: ads.then((adList) => adList.availabilityDomains[0].name),

// 		// Always-Free Micro Shape (AMD E2.1.Micro)
// 		shape: "VM.Standard.E2.1.Micro",

// 		displayName: "my-vps-instance",

// 		createVnicDetails: {
// 			subnetId: subnet.id,
// 			assignPublicIp: "true", // Requests a public IPv4 address
// 			displayName: "primary-vnic",
// 		},

// 		sourceDetails: {
// 			sourceType: "image",
// 			imageId: ubuntuImage.then((img) => img.images[0].id),
// 		},

// 		metadata: {
// 			// Essential metadata block to provision your SSH Key
// 			ssh_authorized_keys: sshPublicKey,
// 		},
// 	});

// 	const vpsPublicIp = instance.publicIp;
// }
