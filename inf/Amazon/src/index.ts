import { Server } from "./vps/server.ts";

const vps = new Server("vps-main");

export const vpsIp = vps.publicIpAddress;
export const vpsUsername = vps.username;
export const vpsInstanceId = vps.instanceId;
export const vpsPrivateKey = vps.privateKey;
export const vpsSshPort = vps.sshPort;
