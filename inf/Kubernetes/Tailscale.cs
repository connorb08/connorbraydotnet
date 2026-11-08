using System.Collections.Immutable;
using Pulumi;
using Pulumi.Kubernetes.Types.Inputs.Helm.V4;
using Pulumi.Kubernetes.Types.Inputs.Meta.V1;

namespace Inf.K8S;

internal static class Tailscale
{
    public static Pulumi.Kubernetes.Helm.V4.Chart CreateResources()
    {
        var config = new Config();
        var clientId = RequireCredential(config, "tailscaleClientId");
        var clientSecret = RequireCredential(config, "tailscaleClientSecret");

        var tailscaleNamespace = new Pulumi.Kubernetes.Core.V1.Namespace("tailscale", new()
        {
            Metadata = new ObjectMetaArgs { Name = "tailscale" }
        });

        var oauthSecret = new Pulumi.Kubernetes.Core.V1.Secret("tailscale-operator-oauth", new()
        {
            Metadata = new ObjectMetaArgs
            {
                Name = "operator-oauth",
                Namespace = tailscaleNamespace.Metadata.Apply(metadata => metadata.Name)
            },
            Type = "Opaque",
            StringData =
            {
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret
            }
        }, new CustomResourceOptions
        {
            AdditionalSecretOutputs = { "data", "stringData" }
        });

        return new Pulumi.Kubernetes.Helm.V4.Chart("tailscale-operator", new()
        {
            Name = "tailscale-operator",
            Chart = "tailscale-operator",
            Version = "1.104.4",
            Namespace = "tailscale",
            RepositoryOpts = new RepositoryOptsArgs
            {
                Repo = "https://pkgs.tailscale.com/helmcharts"
            },
            Values = new Dictionary<string, object>
            {
                ["oauthSecretVolume"] = new Dictionary<string, object>
                {
                    ["secret"] = new Dictionary<string, object>
                    {
                        ["secretName"] = "operator-oauth"
                    }
                },
                ["operatorConfig"] = new Dictionary<string, object>
                {
                    ["defaultTags"] = new[] { "tag:k8s-operator" }
                },
                ["apiServerProxyConfig"] = new Dictionary<string, object>
                {
                    ["mode"] = "true",
                    ["allowImpersonation"] = "true"
                }
            }
        }, new ComponentResourceOptions
        {
            DependsOn = { oauthSecret },
            ResourceTransforms =
            {
                (args, _) => Task.FromResult(NormalizeDownwardApi(args))
            }
        });
    }

    private static ResourceTransformResult? NormalizeDownwardApi(ResourceTransformArgs args)
    {
        if (args.Type != "kubernetes:apps/v1:Deployment")
            return null;

        if (args.Args.GetValueOrDefault("spec") is not ImmutableDictionary<string, object?> spec ||
            spec.GetValueOrDefault("template") is not ImmutableDictionary<string, object?> template ||
            template.GetValueOrDefault("spec") is not ImmutableDictionary<string, object?> podSpec ||
            podSpec.GetValueOrDefault("containers") is not ImmutableArray<object?> containers)
            throw new InvalidOperationException("Tailscale Deployment is missing its pod containers.");

        var updatedContainers = containers.Select(value =>
        {
            if (value is not ImmutableDictionary<string, object?> container)
                throw new InvalidOperationException("Tailscale pod containers must be mappings.");

            if (!container.TryGetValue("env", out var envValue))
                return value;

            if (envValue is not ImmutableArray<object?> environment)
                throw new InvalidOperationException("Tailscale container environment must be a list.");

            var updatedEnvironment = environment.Select(entry =>
            {
                if (entry is not ImmutableDictionary<string, object?> variable)
                    throw new InvalidOperationException("Tailscale environment entries must be mappings.");

                if (variable.GetValueOrDefault("valueFrom") is not ImmutableDictionary<string, object?> valueFrom ||
                    valueFrom.GetValueOrDefault("fieldRef") is not ImmutableDictionary<string, object?> fieldRef ||
                    fieldRef.ContainsKey("apiVersion"))
                    return entry;

                // Match Kubernetes' default before SSA compares the atomic fieldRef object.
                return variable.SetItem("valueFrom",
                    valueFrom.SetItem("fieldRef", fieldRef.SetItem("apiVersion", "v1")));
            }).ToImmutableArray();

            return container.SetItem("env", updatedEnvironment);
        }).ToImmutableArray();

        var properties = args.Args.SetItem("spec", spec.SetItem("template",
            template.SetItem("spec", podSpec.SetItem("containers", updatedContainers))));
        return new ResourceTransformResult(properties, args.Options);
    }

    private static Output<string> RequireCredential(Config config, string key) =>
        config.RequireSecret(key).Apply(value =>
            !string.IsNullOrWhiteSpace(value)
                ? value
                : throw new InvalidOperationException($"Tailscale: {key} must not be empty."));
}