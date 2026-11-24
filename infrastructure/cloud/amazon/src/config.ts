import { getCallerIdentityOutput, getRegionOutput } from "@pulumi/aws";

export const awsConfig = {
	account: getCallerIdentityOutput({}),
	region: getRegionOutput({}).apply((result) => result.region),
};
