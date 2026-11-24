import { vaultIam } from "./vault";
import { ComponentResource } from "@pulumi/pulumi";

export const defineIam = () => {
	const root = new ComponentResource("connor-bray:infrastructure/aws:Iam", "iam");
	const vault = vaultIam(root);
	return { root, vault };
};
