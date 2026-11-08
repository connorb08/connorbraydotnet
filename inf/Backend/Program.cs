using System.Text.Json;
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var stateBucket = new Aws.S3.Bucket("state-bucket", new Aws.S3.BucketArgs()
    {
        BucketPrefix = "state-",
        BucketNamespace = "account-regional",
        ForceDestroy = false
    }, new CustomResourceOptions
    {
        Protect = true
    });

    var versioning = new Aws.S3.BucketVersioning("state-bucket-versioning", new()
    {
        Bucket = stateBucket.Id,
        VersioningConfiguration = new Aws.S3.Inputs.BucketVersioningVersioningConfigurationArgs
        {
            Status = "Enabled"
        }
    });

    var encryption = new Aws.S3.BucketServerSideEncryptionConfiguration("state-bucket-encryption", new()
    {
        Bucket = stateBucket.Id,
        Rules =
            {
                new Aws.S3.Inputs.BucketServerSideEncryptionConfigurationRuleArgs
                {
                    ApplyServerSideEncryptionByDefault = new Aws.S3.Inputs.BucketServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefaultArgs
                    {
                        SseAlgorithm = "AES256"
                    }
                }
            }
    });

    var publicAccessBlock = new Aws.S3.BucketPublicAccessBlock("state-bucket-public-access", new()
    {
        Bucket = stateBucket.Id,
        BlockPublicAcls = true,
        BlockPublicPolicy = true,
        IgnorePublicAcls = true,
        RestrictPublicBuckets = true
    });

    var ownershipControls = new Aws.S3.BucketOwnershipControls("state-bucket-ownership", new()
    {
        Bucket = stateBucket.Id,
        Rule = new Aws.S3.Inputs.BucketOwnershipControlsRuleArgs
        {
            ObjectOwnership = "BucketOwnerEnforced"
        }
    });

    var transportPolicy = new Aws.S3.BucketPolicy("state-bucket-https-only", new()
    {
        Bucket = stateBucket.Id,
        Policy = stateBucket.Arn.Apply(arn => JsonSerializer.Serialize(new
        {
            Version = "2012-10-17",
            Statement = new[]
            {
                new
                {
                    Sid = "DenyInsecureTransport",
                    Effect = "Deny",
                    Principal = "*",
                    Action = "s3:*",
                    Resource = new[] { arn, $"{arn}/*" },
                    Condition = new
                    {
                        Bool = new Dictionary<string, string>
                        {
                            ["aws:SecureTransport"] = "false"
                        }
                    }
                }
            }
        }))
    });

    var backendAccessPolicy = new Aws.Iam.Policy("state-backend-access", new()
    {
        Description = "Read, write, and lock Pulumi state in the backend bucket.",
        PolicyDocument = stateBucket.Arn.Apply(arn => JsonSerializer.Serialize(new
        {
            Version = "2012-10-17",
            Statement = new object[]
            {
                new
                {
                    Sid = "ListStateBucket",
                    Effect = "Allow",
                    Action = new[] { "s3:ListBucket", "s3:GetBucketLocation" },
                    Resource = arn
                },
                new
                {
                    Sid = "ManageStateObjects",
                    Effect = "Allow",
                    Action = new[] { "s3:GetObject", "s3:PutObject", "s3:DeleteObject" },
                    Resource = $"{arn}/*"
                }
            }
        }))
    });


    return new Dictionary<string, object?>()
    {
        ["stateBucketName"] = stateBucket.Id,
        ["stateBackendUrl"] = stateBucket.Id.Apply(name => $"s3://{name}"),
        ["stateBackendPolicyArn"] = backendAccessPolicy.Arn
    };
});
