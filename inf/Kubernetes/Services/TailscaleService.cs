using Inf.Kubernetes.Configuration;
using Microsoft.Extensions.Logging;
using Org.Cdk8s;
using Org.Cdk8s.Plus37.K8S;

namespace Inf.Kubernetes.Services;

public interface IServiceConfig : IDeploymentConfig
{
    string Hostname { get; }
    string AppName { get; }
    int TargetPort { get; }
    int Port { get; }
}

internal sealed class TailscaleService(
    App scope,
    ILogger<TailscaleService> logger,
    IServiceConfig deployment
) : Release(scope, deployment)
{

    private readonly string _namespace = deployment.Namespace;
    private readonly string _hostname = deployment.Hostname;
    private readonly string _appName = deployment.AppName;
    private readonly int _targetPort = deployment.TargetPort;
    private readonly int _port = deployment.Port;

    protected override void CreateBuild()
    {

        logger.LogInformation("Creating Tailscale Service in namespace {Namespace}", _namespace);

        _ = new KubeService(this, $"{_appName}-tailscale-service", new KubeServiceProps
        {
            Metadata = new ObjectMeta
            {
                Name = $"{_appName}-tailscale-service",
                Annotations = new Dictionary<string, string>
                 {
                     { "tailscale.com/hostname", _hostname }
                 }
            },
            Spec = new ServiceSpec
            {
                Type = "LoadBalancer",
                LoadBalancerClass = "tailscale",
                Selector = new Dictionary<string, string>
                {
                    { "app", _appName }
                },
                Ports =
                [
                    new ServicePort
                    {
                        Port = _port,
                        TargetPort = IntOrString.FromNumber(_targetPort)
                    }
                ]
            }
        });

        logger.LogInformation("Tailscale Service created in namespace {Namespace}", _namespace);

    }
}
