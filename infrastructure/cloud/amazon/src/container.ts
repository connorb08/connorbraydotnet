import type { Role, User } from "@pulumi/aws/iam";
import type { ComponentResource } from "@pulumi/pulumi";
import { ecrRoot } from "./ecr";
import { iamResources, type IamResources } from "./ecr/auth";
import { defineRepositories, type Repositories } from "./ecr/repositories";
import { defineIam } from "./iam";
import { adminRole } from "./iam/admin";
import { asFunction, createContainer } from "awilix";

export interface Cradle {
	iam: ReturnType<typeof defineIam>;
	vaultUser: User;
	adminRole: Role;
	ecrRoot: ComponentResource;
	iamResources: IamResources;
	repositories: Repositories;
}

const container = createContainer<Cradle>();

container.register({
	iam: asFunction(defineIam).singleton(),
	vaultUser: asFunction(({ iam }: Cradle) => iam.vault.user).singleton(),
	adminRole,
	ecrRoot,
	iamResources,
	repositories: defineRepositories,
});

export { container };
