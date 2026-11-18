import type { Provider, User } from "@pulumi/authentik";
import type { Resource } from "@pulumi/pulumi";
import { config, type StackConfig } from "./config";
import { provider } from "./provider";
import { root } from "./root";
import { users } from "./users";
import { createContainer } from "awilix";

export interface Cradle {
	root: Resource;
	config: StackConfig;
	provider: Provider;
	users: User[];
}

const container = createContainer<Cradle>();

container.register({
	root,
	provider,
	config,
	users,
});

export { container };
