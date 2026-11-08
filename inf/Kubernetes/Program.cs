using Inf.K8S;
using Pulumi;

return await Deployment.RunAsync(() =>
{
    var tailscale = Tailscale.CreateResources();
    return Vault.CreateResources(tailscale);
});
