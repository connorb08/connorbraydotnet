using Inf.Kubernetes.Configuration;
using Org.Cdk8s;

namespace Inf.Kubernetes;

internal abstract class Release(App scope, IDeploymentConfig deployment)
    : Chart(scope, deployment.Id, new ChartProps { Namespace = string.IsNullOrEmpty(deployment.Namespace) ? null : deployment.Namespace })
{
    protected IDeploymentConfig Deployment { get; } = deployment;

    /// <summary>Prepares, then adds the chart's objects; the app is then synthesized by the caller.</summary>
    public async Task<App> BuildAsync(CancellationToken cancellationToken = default)
    {
        await PrepareAsync(cancellationToken);
        CreateBuild();
        return scope;
    }

    /// <summary>Fetches what <see cref="CreateBuild"/> needs and only an async call gives (resolved secrets); nothing by default.</summary>
    protected virtual Task PrepareAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    protected abstract void CreateBuild();
}
