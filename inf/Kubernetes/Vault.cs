using System.Collections.Immutable;
using System.Security.Cryptography;
using System.Text;
using Pulumi;
using Pulumi.Kubernetes.Types.Inputs.Meta.V1;
using Pulumi.Kubernetes.Types.Inputs.Helm.V4;
using Pulumi.Kubernetes.Types.Inputs.Networking.V1;
using Tls = Pulumi.Tls;

namespace Inf.K8S;

internal static class Vault
{
    public static Dictionary<string, object?> CreateResources(Resource tailscaleOperator)
    {
        var vaultNamespace = new Pulumi.Kubernetes.Core.V1.Namespace("vault", new()
        {
            Metadata = new ObjectMetaArgs { Name = "vault" }
        });

    var privateKey = new Tls.PrivateKey("vault-internal-tls-key", new()
    {
        Algorithm = "RSA",
        RsaBits = 2048
    });

    var certificate = new Tls.SelfSignedCert("vault-internal-tls-cert", new()
    {
        PrivateKeyPem = Output.CreateSecret(privateKey.PrivateKeyPem),
        Subject = new Tls.Inputs.SelfSignedCertSubjectArgs
        {
            CommonName = "vault.vault.svc"
        },
        DnsNames =
        {
            "localhost",
            "vault",
            "vault.vault",
            "vault.vault.svc",
            "vault.vault.svc.cluster.local",
            "vault-ui",
            "vault-ui.vault",
            "vault-ui.vault.svc",
            "vault-ui.vault.svc.cluster.local",
            "vault-internal",
            "vault-internal.vault",
            "vault-internal.vault.svc",
            "vault-internal.vault.svc.cluster.local",
            "*.vault-internal.vault.svc",
            "*.vault-internal.vault.svc.cluster.local"
        },
        IpAddresses = { "127.0.0.1", "::1" },
        AllowedUses = { "key_encipherment", "digital_signature", "server_auth" },
        ValidityPeriodHours = 8760,
        EarlyRenewalHours = 720
    });

    var tlsSecret = new Pulumi.Kubernetes.Core.V1.Secret("vault-internal-tls", new()
    {
        Metadata = new ObjectMetaArgs
        {
            Name = "vault-internal-tls",
            Namespace = vaultNamespace.Metadata.Apply(metadata => metadata.Name)
        },
        Type = "kubernetes.io/tls",
        StringData =
        {
            ["tls.crt"] = certificate.CertPem,
            ["tls.key"] = Output.CreateSecret(privateKey.PrivateKeyPem),
            ["ca.crt"] = certificate.CertPem
        }
    }, new CustomResourceOptions
    {
        AdditionalSecretOutputs = { "data", "stringData" }
    });

    var tlsChecksum = certificate.CertPem.Apply(pem =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(pem))));

    var vault = new Pulumi.Kubernetes.Helm.V4.Chart("vault", new()
    {
        Name = "vault",
        Chart = "vault",
        Namespace = "vault",
        RepositoryOpts = new RepositoryOptsArgs
        {
            Repo = "https://helm.releases.hashicorp.com"
        },
        Values = new Dictionary<string, object>
        {
            ["global"] = new Dictionary<string, object>
            {
                ["tlsDisable"] = false
            },
            ["server"] = new Dictionary<string, object>
            {
                ["volumes"] = new[]
                {
                    new Dictionary<string, object>
                    {
                        ["name"] = "internal-tls",
                        ["secret"] = new Dictionary<string, object>
                        {
                            ["secretName"] = "vault-internal-tls"
                        }
                    }
                },
                ["volumeMounts"] = new[]
                {
                    new Dictionary<string, object>
                    {
                        ["name"] = "internal-tls",
                        ["mountPath"] = "/vault/userconfig/internal-tls",
                        ["readOnly"] = true
                    }
                },
                ["extraEnvironmentVars"] = new Dictionary<string, object>
                {
                    ["VAULT_CACERT"] = "/vault/userconfig/internal-tls/ca.crt"
                },
                ["ha"] = new Dictionary<string, object>
                {
                    ["enabled"] = true,
                    ["replicas"] = 1,
                    ["apiAddr"] = "https://vault.vault.svc:8200",
                    ["disruptionBudget"] = new Dictionary<string, object>
                    {
                        ["enabled"] = false
                    },
                    ["raft"] = new Dictionary<string, object>
                    {
                        ["enabled"] = true,
                        ["setNodeId"] = true,
                        ["config"] = """
                            ui = true
                            listener "tcp" {
                              address = "[::]:8200"
                              cluster_address = "[::]:8201"
                              tls_disable = 0
                              tls_cert_file = "/vault/userconfig/internal-tls/tls.crt"
                              tls_key_file = "/vault/userconfig/internal-tls/tls.key"
                            }
                            storage "raft" {
                              path = "/vault/data"
                            }
                            disable_mlock = true
                            """
                    }
                }
            },
            ["ui"] = new Dictionary<string, object>
            {
                ["enabled"] = true,
                ["serviceType"] = "ClusterIP",
                ["externalPort"] = 443,
                ["targetPort"] = 8200,
                ["annotations"] = new Dictionary<string, object>
                {
                    ["tailscale.com/tags"] = "tag:vault"
                }
            }
        }
    }, new ComponentResourceOptions
    {
        DependsOn = { tlsSecret },
        ResourceTransforms =
        {
            (args, _) => Task.FromResult(AddTlsChecksum(args, tlsChecksum))
        }
    });

    _ = new Pulumi.Kubernetes.Networking.V1.Ingress("vault-ingress", new ()
    {
        Metadata = new ObjectMetaArgs
        {
            Name = "vault-secure-access",
            Namespace = vaultNamespace.Metadata.Apply(metadata => metadata.Name),
            Annotations =
            {
            ["tailscale.com/tags"] = "tag:vault",
                ["tailscale.com/http-redirect"] = "true"
            }
        },
        Spec = new IngressSpecArgs
        {
            IngressClassName = "tailscale",
            Tls = { new IngressTLSArgs { Hosts = { "vault" } } },
            Rules =
            {
                new IngressRuleArgs
                {
                    Http = new HTTPIngressRuleValueArgs
                    {
                        Paths =
                        {
                            new HTTPIngressPathArgs
                            {
                                Path = "/",
                                PathType = "Prefix",
                                Backend = new IngressBackendArgs
                                {
                                    Service = new IngressServiceBackendArgs
                                    {
                                        Name = "vault-ui",
                                        Port = new ServiceBackendPortArgs { Number = 443 }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, new CustomResourceOptions
    {
        DependsOn = { vault, tailscaleOperator }
    });

    return new Dictionary<string, object?>
    {
        ["vaultInternalCaCert"] = certificate.CertPem
    };
    }

    private static ResourceTransformResult? AddTlsChecksum(ResourceTransformArgs args, Output<string> checksum)
    {
        if (args.Type != "kubernetes:apps/v1:StatefulSet")
            return null;

        if (args.Args.GetValueOrDefault("spec") is not ImmutableDictionary<string, object?> spec ||
            spec.GetValueOrDefault("template") is not ImmutableDictionary<string, object?> template ||
            template.GetValueOrDefault("metadata") is not ImmutableDictionary<string, object?> metadata)
            throw new InvalidOperationException("Vault StatefulSet is missing its pod template metadata.");

        var annotations = metadata.GetValueOrDefault("annotations") switch
        {
            null => ImmutableDictionary<string, object?>.Empty,
            ImmutableDictionary<string, object?> existing => existing,
            _ => throw new InvalidOperationException("Vault pod template annotations must be a mapping.")
        };

        var properties = args.Args.SetItem("spec", spec.SetItem("template",
            template.SetItem("metadata", metadata.SetItem("annotations",
                annotations.SetItem("checksum/internal-tls", checksum)))));

        return new ResourceTransformResult(properties, args.Options);
    }
}
