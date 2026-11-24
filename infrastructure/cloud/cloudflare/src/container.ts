import type { Resource } from "@pulumi/pulumi";
import { config, type StackConfig } from "./config";
import { root } from "./root";
import { createContainer } from "awilix";

export interface Cradle {
	root: Resource;
	config: StackConfig;
}

const container = createContainer<Cradle>();

container.register({
	root,
	config,
});

export { container };
