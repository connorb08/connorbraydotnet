import { createVps } from "./vps.ts";

const { instance, vpsPublicIp } = await createVps();

export const instanceId = instance.id;
export const publicIp = vpsPublicIp;
export const privateIp = instance.privateIp;
export const availabilityDomain = instance.availabilityDomain;
