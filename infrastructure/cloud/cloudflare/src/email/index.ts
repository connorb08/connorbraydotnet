import type { Cradle } from "../container";
import { createForwardRule } from "./routing";
import { ComponentResource } from "@pulumi/pulumi";
import { asFunction } from "awilix";

export const email = asFunction(async ({ root }: Cradle) => {
	const node = new ComponentResource(
		"connor-bray:infrastructure:cloud:cloudflare:Email",
		"email",
		{ parent: root },
	);

	const emailRoutes = await createEmailRouting(node);
	return {
		routes: emailRoutes.map((route) => route.name),
	};
}).singleton();

const createEmailRouting = async (parent: ComponentResource) => {
	const node = new ComponentResource(
		"connor-bray:infrastructure:cloud:cloudflare:email:Routing",
		"email",
		{ parent },
	);

	return await Promise.all([
		createForwardRule("root@bray.sh", "connor@connorbray.net", node),
		Promise.resolve({ name: "dummy-route" }),
	]);
};
