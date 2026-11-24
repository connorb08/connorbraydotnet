export { awsConfig } from "./config";
import { awsConfig } from "./config";
import { container } from "./container";
import { secret } from "@pulumi/pulumi";

export const iam = container.resolve("iam");
// Keyed by repository name so reordering or removing a repository only touches its own entry.
export const repositories = Object.fromEntries(
	Object.entries(container.resolve("repositories").repositories).map(([name, repo]) => [
		name,
		{ name: repo.name, url: repo.repositoryUrl },
	]),
);

const ecrIam = container.resolve("iamResources");
export const awsRegion = awsConfig.region;
export const vaultAwsAccessKeyId = iam.vault.accessKey.id;
export const vaultAwsSecretAccessKey = secret(iam.vault.accessKey.secret);
export const ecrReadRoleArn = ecrIam.readRole.arn;
export const ecrWriteRoleArn = ecrIam.writeRole.arn;
export const awsAdminRoleArn = container.resolve("adminRole").arn;
