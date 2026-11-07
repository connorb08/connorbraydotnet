using Microsoft.Extensions.Logging;

namespace Infrastructure.Registry;

internal sealed class Template(ILogger<Template> logger)
{
    public void Create()
    {
        logger.LogInformation("Creating repository template");
        var lifecyle = new Aws.Ecr.LifecyclePolicy("repo-template-lifecycle", new Aws.Ecr.LifecyclePolicyArgs());
        var policy = new Aws.Ecr.RegistryPolicy("registry-policy", new Aws.Ecr.RegistryPolicyArgs());
        var template = new Aws.Ecr.RepositoryCreationTemplate("repo-template", new Aws.Ecr.RepositoryCreationTemplateArgs()
        {
            Prefix = "repo-template",
            Description = "Repository template for ECR",
            AppliedFors = ["CREATE_ON_PUSH", "PULL_THROUGH_CACHE", "REPLICATION"],
            LifecyclePolicy = lifecyle.Policy,
            Region = "us-east-2",
            EncryptionConfigurations = new Aws.Ecr.Inputs.RepositoryCreationTemplateEncryptionConfigurationArgs
            {
                EncryptionType = "AES256",
            },
            RepositoryPolicy = policy.Policy,
            ResourceTags =
            {
                { "Environment", "Development" },
                { "Project", "RepoTemplate" }
            }
        });
        logger.LogInformation("Repository template created: {Template}", template.Id);
    }
}
