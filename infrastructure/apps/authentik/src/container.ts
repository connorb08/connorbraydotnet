import type { Application, Provider, User } from "@pulumi/authentik";
import type { Resource } from "@pulumi/pulumi";
import { config, type StackConfig } from "./config";
import { donetick } from "./donetick";
import { netbird, type NetbirdOidc } from "./netbird";
import { provider } from "./provider";
import { root } from "./root";
import { users } from "./users";
import { vikunja } from "./vikunja";
import { createContainer } from "awilix";

export interface Cradle {
	root: Resource;
	config: StackConfig;
	provider: Provider;
	users: User[];
	donetick: Application;
	netbird: NetbirdOidc;
	vikunja: Application;
}

const container = createContainer<Cradle>();

container.register({
	root,
	provider,
	config,
	users,
	donetick,
	netbird,
	vikunja,
});

export { container };
