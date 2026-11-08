using Inf.Amazon.Vps;

namespace Inf.Amazon;

public static class Program
{
    public static Task<int> Main(string[] args) => Deployment.RunAsync(() =>
    {

        string vps_name = "vps-main";

        var vps = new Server(vps_name);

        return new Dictionary<string, object?>
        {
            ["vpsIp"] = vps.PublicIpAddress,
            ["vpsUsername"] = vps.Username,
            ["vpsInstanceId"] = vps.InstanceId,
            ["vpsPrivateKey"] = vps.PrivateKey,
            ["vpsSshPort"] = vps.SshPort
        };

    });
}
