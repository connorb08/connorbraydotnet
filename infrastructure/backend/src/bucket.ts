import { iam, s3 } from "@pulumi/aws";

export const stateBucket = new s3.Bucket(
	"state-bucket",
	{ bucketPrefix: "state-", bucketNamespace: "account-regional", forceDestroy: false },
	{ protect: true },
);

const _versioning = new s3.BucketVersioning("state-bucket-versioning", {
	bucket: stateBucket.id,
	versioningConfiguration: { status: "Enabled" },
});
const _encryption = new s3.BucketServerSideEncryptionConfiguration(
	"state-bucket-encryption",
	{
		bucket: stateBucket.id,
		rules: [{ applyServerSideEncryptionByDefault: { sseAlgorithm: "AES256" } }],
	},
);
const _publicAccess = new s3.BucketPublicAccessBlock("state-bucket-public-access", {
	bucket: stateBucket.id,
	blockPublicAcls: true,
	blockPublicPolicy: true,
	ignorePublicAcls: true,
	restrictPublicBuckets: true,
});
const _ownership = new s3.BucketOwnershipControls("state-bucket-ownership", {
	bucket: stateBucket.id,
	rule: { objectOwnership: "BucketOwnerEnforced" },
});
const _httpsOnly = new s3.BucketPolicy("state-bucket-https-only", {
	bucket: stateBucket.id,
	policy: stateBucket.arn.apply((arn) =>
		JSON.stringify({
			Version: "2012-10-17",
			Statement: [
				{
					Sid: "DenyInsecureTransport",
					Effect: "Deny",
					Principal: "*",
					Action: "s3:*",
					Resource: [arn, `${arn}/*`],
					Condition: { Bool: { "aws:SecureTransport": "false" } },
				},
			],
		}),
	),
});
export const backendAccessPolicy = new iam.Policy("state-backend-access", {
	description: "Read, write, and lock Pulumi state in the backend bucket.",
	policy: stateBucket.arn.apply((arn) =>
		JSON.stringify({
			Version: "2012-10-17",
			Statement: [
				{
					Sid: "ListStateBucket",
					Effect: "Allow",
					Action: ["s3:ListBucket", "s3:GetBucketLocation"],
					Resource: arn,
				},
				{
					Sid: "ManageStateObjects",
					Effect: "Allow",
					Action: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
					Resource: `${arn}/*`,
				},
			],
		}),
	),
});
