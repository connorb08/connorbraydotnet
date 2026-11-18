import { backendAccessPolicy, stateBucket } from "./bucket.ts";
import { stateSecretsAccessPolicy, stateSecretsKey } from "./kms.ts";
import { all } from "@pulumi/pulumi";

export const stateBucketName = stateBucket.id;
export const stateBackendUrl = stateBucket.id.apply((name) => `s3://${name}`);
export const stateBackendPolicyArn = backendAccessPolicy.arn;
export const stateSecretsKeyId = stateSecretsKey.keyId;
export const stateSecretsKeyArn = stateSecretsKey.arn;
export const stateSecretsProviderUrl = all([
	stateSecretsKey.keyId,
	stateSecretsKey.region,
]).apply(([keyId, region]) => `awskms://${keyId}?region=${region}`);
export const stateSecretsPolicyArn = stateSecretsAccessPolicy.arn;
