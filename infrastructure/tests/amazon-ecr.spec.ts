import type { ResourceTransformationArgs } from "@pulumi/pulumi";
import type { MockResourceArgs } from "@pulumi/pulumi/runtime";
import { resolveOutput } from "./mock-runtime";
import { isSecret, runtime } from "@pulumi/pulumi";
import { beforeAll, expect, test } from "bun:test";

const resources: MockResourceArgs[] = [];
const registrations: ResourceTransformationArgs[] = [];
const vaultUserArn = "arn:aws:iam::123456789012:user/vault/vault-aws-secrets-engine";
let container: typeof import("../cloud/amazon/src/container").container;

beforeAll(async () => {
	await runtime.setMocks(
		{
			newResource: (args) => {
				resources.push(args);
				const state = { ...args.inputs };
				if (args.type === "aws:iam/user:User") {
					state.arn = vaultUserArn;
				}
				if (args.type === "aws:iam/role:Role") {
					state.arn = `arn:aws:iam::123456789012:role/${args.name}`;
				}
				if (args.type === "aws:iam/accessKey:AccessKey") {
					state.secret = "test-aws-secret-key";
				}
				return { id: args.name, state };
			},
			call: (args) => {
				if (args.token === "aws:index/getCallerIdentity:getCallerIdentity") {
					return { accountId: "123456789012" };
				}
				if (args.token === "aws:index/getRegion:getRegion") {
					return { region: "us-east-2" };
				}
				if (args.token === "aws:iam/getPolicyDocument:getPolicyDocument") {
					return { json: "{}" };
				}
				throw new Error(`Unexpected AWS lookup: ${args.token}`);
			},
		},
		"amazon",
		"test",
		false,
	);

	try {
		await runtime.runInPulumiStack(async () => {
			runtime.registerStackTransformation((args) => {
				registrations.push(args);
			});
			({ container } = await import("../cloud/amazon/src/container"));
			const iamResources = container.resolve("iamResources");
			const repositories = container.resolve("repositories");
			expect(container.resolve("iamResources")).toBe(iamResources);
			const program = await import("../cloud/amazon/src/index");
			// The stack exports each repository's name and URL outputs.
			expect(Object.keys(program.repositories).toSorted()).toEqual(
				Object.keys(repositories.repositories).toSorted(),
			);
			for (const [name, repository] of Object.entries(repositories.repositories)) {
				expect(program.repositories[name]?.name).toBe(repository.name);
				expect(program.repositories[name]?.url).toBe(repository.repositoryUrl);
			}
			expect(program.iam).toBe(container.resolve("iam"));
			expect(await isSecret(program.vaultAwsSecretAccessKey)).toBe(true);
			expect(await resolveOutput(program.vaultAwsAccessKeyId)).toBe(
				"vault-aws-access-key",
			);
			expect(await resolveOutput(program.vaultAwsSecretAccessKey)).toBe(
				"test-aws-secret-key",
			);
			expect(await resolveOutput(program.awsRegion)).toBe("us-east-2");
			expect(await resolveOutput(program.ecrReadRoleArn)).toBe(
				"arn:aws:iam::123456789012:role/vault-ecr-devenv-read",
			);
			expect(await resolveOutput(program.ecrWriteRoleArn)).toBe(
				"arn:aws:iam::123456789012:role/vault-ecr-devenv-write",
			);
			expect(await resolveOutput(program.awsAdminRoleArn)).toBe(
				"arn:aws:iam::123456789012:role/vault-admin",
			);
			return { repositories };
		});
	} finally {
		await runtime.disconnect();
	}
});

test("ECR resolves the Vault user through DI and reuses singleton resources", () => {
	const repositories = container.resolve("repositories");
	expect(container.resolve("repositories")).toBe(repositories);
	expect(repositories.root).toBe(container.resolve("ecrRoot"));
	expect(container.resolve("vaultUser")).toBe(container.resolve("iam").vault.user);
	expect(
		resources.filter((resource) => resource.type === "aws:iam/user:User"),
	).toHaveLength(1);
	const root = registrations.find((args) => args.resource === repositories.root);
	expect(root?.opts.dependsOn).toEqual([container.resolve("vaultUser")]);
	const roles = resources.filter(
		(resource) =>
			resource.type === "aws:iam/role:Role" && resource.name.startsWith("vault-ecr-"),
	);
	expect(roles).toHaveLength(2);
	for (const role of registrations.filter(
		(args) => args.type === "aws:iam/role:Role" && args.name.startsWith("vault-ecr-"),
	)) {
		expect(role.opts.parent).toBe(repositories.root);
	}
	for (const role of roles) {
		expect(role.inputs.assumeRolePolicy).toMatchObject({
			Statement: [
				{
					Principal: { AWS: vaultUserArn },
					Action: "sts:AssumeRole",
				},
			],
		});
	}
});

test("personal administrator role trusts Vault and grants AWS AdministratorAccess", () => {
	const role = resources.find(
		(resource) =>
			resource.type === "aws:iam/role:Role" && resource.name === "vault-admin",
	);
	expect(role?.inputs.assumeRolePolicy).toMatchObject({
		Statement: [{ Principal: { AWS: vaultUserArn }, Action: "sts:AssumeRole" }],
	});
	const attachment = resources.find(
		(resource) => resource.type === "aws:iam/rolePolicyAttachment:RolePolicyAttachment",
	);
	expect(attachment?.inputs).toMatchObject({
		role: "vault-admin",
		policyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
	});
	const registration = registrations.find(
		(args) => args.type === "aws:iam/role:Role" && args.name === "vault-admin",
	);
	expect(registration?.opts.parent).toBe(container.resolve("iam").root);
});

test("ECR keeps repository configuration and parenting when resolved through DI", () => {
	const repositories = container.resolve("repositories");
	expect(Object.keys(repositories.repositories)).toHaveLength(4);
	const created = resources.filter(
		(resource) => resource.type === "aws:ecr/repository:Repository",
	);
	expect(created.map((resource) => resource.name).toSorted()).toEqual([
		"devenv",
		"devenv-base",
		"devenv-base-layered",
		"devenv-tools",
	]);
	for (const repository of created) {
		expect(repository.inputs).toMatchObject({
			imageTagMutability: "IMMUTABLE_WITH_EXCLUSION",
			imageTagMutabilityExclusionFilters: [
				{ filterType: "WILDCARD", filter: "latest" },
				{ filterType: "WILDCARD", filter: "buildcache" },
			],
		});
	}
	for (const repository of Object.values(repositories.repositories)) {
		const registration = registrations.find((args) => args.resource === repository);
		expect(registration?.opts.parent).toBe(repositories.root);
	}
	expect(
		resources.filter(
			(resource) => resource.type === "aws:ecr/repositoryPolicy:RepositoryPolicy",
		),
	).toHaveLength(4);
});
