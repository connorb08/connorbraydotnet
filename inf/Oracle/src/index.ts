import { createVps } from "./vps.ts";
import { Config } from "@pulumi/pulumi";

const config = new Config();
const domainIndex = config.getNumber("domainIndex");

const { instance, vpsPublicIp } = await createVps(domainIndex);

export const instanceId = instance.id;
export const publicIp = vpsPublicIp;
export const privateIp = instance.privateIp;
export const availabilityDomain = instance.availabilityDomain;
