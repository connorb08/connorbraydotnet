//#region Imports

import type { Cradle } from "../container";
import type { RepositoryArgs } from "@pulumi/aws/ecr";
import type { ComponentResource } from "@pulumi/pulumi";
import { ecr } from "@pulumi/aws";
import { asFunction } from "awilix";

//#endregion Imports

//#region Types

/**
 * Resources created by the ECR resolver.
 */
export interface Repositories {
	root: ComponentResource;
	repositories: ecr.Repository[];
}

//#endregion Types

//#region Exports

/**
 * Creates ECR repositories using the injected root and IAM policy.
 */
export const defineRepositories = asFunction(
	({ ecrRoot: root, iamResources: { repoPolicyJson } }: Cradle): Repositories => {
		const createdRepos: ecr.Repository[] = [];

		// Create each repository with the shared defaults and attach its policy.
		for (const repo of repos) {
			const repository = new ecr.Repository(
				repo.name,
				{ ...defaults, ...repo },
				{ parent: root },
			);

			createdRepos.push(repository);

			const _ = new ecr.RepositoryPolicy(
				`${repo.name}-policy`,
				{
					repository: repository.name,
					policy: repoPolicyJson.json,
				},
				{ parent: repository },
			);
		}

		return { root, repositories: createdRepos };
	},
).singleton();

//#endregion Exports

//#region Repository configuration

const defaults: RepositoryArgs = {
	imageTagMutability: "IMMUTABLE_WITH_EXCLUSION",
	imageTagMutabilityExclusionFilters: [
		{
			filterType: "WILDCARD",
			filter: "latest",
		},
		{
			filterType: "WILDCARD",
			filter: "buildcache",
		},
	],
};

const repos: (RepositoryArgs & { name: string })[] = [
	{
		name: "devenv-base",
	},
	{
		name: "devenv-tools",
	},
	{
		name: "devenv",
	},
	{
		name: "devenv-base-layered",
	},
];

//#endregion Repository configuration
