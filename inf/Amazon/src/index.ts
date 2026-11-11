import { AwsIam } from "./iam/index.ts";
import { Server } from "./vps/server.ts";

const vps = new Server("vps-main");

export const vpsIp = vps.publicIpAddress;
export const vpsUsername = vps.username;
export const vpsInstanceId = vps.instanceId;
export const vpsPrivateKey = vps.privateKey;
export const vpsSshPort = vps.sshPort;

const iam = new AwsIam("iam-main", {
	bootstrapVault: false,
});

export const vaultBootstrapAccessKeyId = iam.bootstrapAccessKeyId;
export const vaultBootstrapSecretAccessKey = iam.bootstrapSecretAccessKey;
export const pulumiDeployRoleArn = iam.pulumiDeployRoleArn;
export const vaultUserArn = iam.vaultUserArn;
export const adminRoleArn = iam.adminRoleArn;
