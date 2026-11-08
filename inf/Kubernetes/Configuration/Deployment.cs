namespace Inf.Kubernetes.Configuration;

public interface IDeploymentConfig
{
    string Id { get; }
    string Namespace { get; }
    void Validate();
}
