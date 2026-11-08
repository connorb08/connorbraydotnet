using Inf.Kubernetes.Configuration;
using Microsoft.Extensions.Logging;
using Org.Cdk8s;
using Org.Cdk8s.Plus37.K8S;

namespace Inf.Kubernetes.Charts;

internal sealed class TailscaleChart(
    App scope,
    ILogger<TailscaleChart> logger,
    TailscaleConfig deployment
) : Release(scope, deployment)
{

    private readonly string _namespace = deployment.Namespace ?? "tailscale";

    protected override void CreateBuild()
    {

        logger.LogInformation("Creating Tailscale namespace and Helm release in namespace {Namespace}", _namespace);

        _ = new KubeNamespace(this, "TailscaleNamespace", new KubeNamespaceProps
        {
            Metadata = new ObjectMeta { Name = _namespace }
        });

        _ = new Helm(this, "tailscale-operator", new HelmProps
        {
            Chart = "tailscale-operator",
            Repo = "https://pkgs.tailscale.com/helmcharts",
            HelmFlags = ["--namespace", _namespace],
            Values = new Dictionary<string, object>
                {
                    {
                        "oauth", new Dictionary<string, object>
                        {
                            { "clientId", deployment.ClientId },
                            { "clientSecret", deployment.ClientSecret }
                        }
                    },
                    {
                        "apiServerProxyConfig", new Dictionary<string, object>
                        {
                            { "mode", "true" },
                            { "allowImpersonation", "true" }
                        }
                    }
                }
        });

        logger.LogInformation("Tailscale Helm release created in namespace {Namespace}", _namespace);

    }
}
