namespace Inf.Kubernetes.Configuration;

internal sealed class TailscaleConfig : IDeploymentConfig
{
    public string Id { get; set; } = "";
    public string Namespace { get; set; } = "";
    public string ClientId { get; set; } = "";
    public string ClientSecret { get; set; } = "";

    public void Validate()
    {

        if (string.IsNullOrWhiteSpace(ClientId))
        {
            throw new InvalidOperationException($"{nameof(TailscaleConfig)}: {nameof(ClientId)} is required.");
        }
        if (string.IsNullOrWhiteSpace(ClientSecret))
        {
            throw new InvalidOperationException($"{nameof(TailscaleConfig)}: {nameof(ClientSecret)} is required.");
        }

    }
}
