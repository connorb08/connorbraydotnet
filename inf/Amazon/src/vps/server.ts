import type { ComponentResourceOptions, Output } from "@pulumi/pulumi";
import { TlsKeyPair } from "./tls-key-pair.ts";
import { lightsail } from "@pulumi/aws";
import { ComponentResource, output } from "@pulumi/pulumi";
import { readFileSync } from "node:fs";
import process from "node:process";

const nonDigit = /[^0-9]/u;

export function parseSshPort(value: string | undefined): number {
	const port = Number(value);
	if (
		value === undefined ||
		value.length === 0 ||
		nonDigit.test(value) ||
		!Number.isInteger(port) ||
		port < 1024 ||
		port > 65535
	) {
		throw new Error("VPS_SSH_PORT must be an integer between 1024 and 65535.");
	}
	return port;
}

export class Server extends ComponentResource {
	readonly instanceId: Output<string>;
	readonly instanceArn: Output<string>;
	readonly publicIpAddress: Output<string>;
	readonly username: Output<string>;
	readonly privateKey: Output<string>;
	readonly sshPort: Output<number>;

	constructor(name: string, options?: ComponentResourceOptions) {
		super("connor-bray:infrastructure:aws:vps:Server", name, {}, options);
		const sshPort = parseSshPort(process.env.VPS_SSH_PORT);
		const keys = new TlsKeyPair(`${name}-keys`, { parent: this });
		const lightsailKey = new lightsail.KeyPair(
			`${name}-ssh`,
			{ publicKey: keys.publicKeyValue },
			{ parent: this },
		);

		const userData = readFileSync(
			new URL("./init.sh", import.meta.url),
			"utf8",
		).replaceAll("__SSH_PORT__", String(sshPort));
		const vps = new lightsail.Instance(
			name,
			{
				availabilityZone: "us-east-2a",
				blueprintId: "amazon_linux_2023",
				bundleId: "medium_3_0",
				ipAddressType: "dualstack",
				name,
				keyPairName: lightsailKey.name,
				userData,
			},
			{
				parent: this,
				deleteBeforeReplace: true,
				replaceOnChanges: ["userData"],
			},
		);
		const _ports = new lightsail.InstancePublicPorts(
			`${name}-ports`,
			{
				instanceName: vps.name,
				portInfos: [sshPort, 80].map((port) => ({
					protocol: "tcp",
					fromPort: port,
					toPort: port,
					cidrs: ["0.0.0.0/0"],
					ipv6Cidrs: ["::/0"],
				})),
			},
			{ parent: this },
		);

		this.instanceId = vps.id;
		this.instanceArn = vps.arn;
		this.publicIpAddress = vps.publicIpAddress;
		this.username = output("dev");
		this.privateKey = keys.privateKeyValue;
		this.sshPort = output(sshPort);
		this.registerOutputs({
			instanceId: this.instanceId,
			instanceArn: this.instanceArn,
			publicIpAddress: this.publicIpAddress,
			username: this.username,
			privateKey: this.privateKey,
			sshPort: this.sshPort,
		});
	}
}
