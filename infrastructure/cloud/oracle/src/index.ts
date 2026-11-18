import { createVps } from "./vps.ts";

const { instance, vpsPublicIp, dataVolume, dataVolumeAttachment } = await createVps();

export const instanceId = instance.id;
export const publicIp = vpsPublicIp;
export const privateIp = instance.privateIp;
export const availabilityDomain = instance.availabilityDomain;
export const dataVolumeId = dataVolume.id;
export const dataVolumeAttachmentId = dataVolumeAttachment.id;
export const dataVolumeDevice = dataVolumeAttachment.device;
