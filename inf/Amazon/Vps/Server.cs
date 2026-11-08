using System.Globalization;

namespace Inf.Amazon.Vps;

internal sealed class Server : ComponentResource
{

    public Output<string> InstanceId { get; }
    public Output<string> InstanceArn { get; }
    public Output<string> PublicIpAddress { get; }
    public Output<string> Username { get; }
    public Output<string> PrivateKey { get; }
    public Output<int> SshPort { get; }

    public Server(string name, ComponentResourceOptions? options = null)
        : base("connor-bray:infrastructure:aws:vps:Server", name, options)
    {
        if (!int.TryParse(Environment.GetEnvironmentVariable("VPS_SSH_PORT"),
                NumberStyles.None, CultureInfo.InvariantCulture, out var sshPort)
            || sshPort is < 1024 or > 65535)
        {
            throw new InvalidOperationException(
                "VPS_SSH_PORT must be an integer between 1024 and 65535.");
        }

        var keys = new TlsKeyPair($"{name}-keys", new ComponentResourceOptions
        {
            Parent = this
        });

        var lightsailKey = new Aws.LightSail.KeyPair($"{name}-ssh", new()
        {
            PublicKey = keys.PublicKeyValue
        }, new CustomResourceOptions
        {
            Parent = this
        });

        using var stream = typeof(Server).Assembly
            .GetManifestResourceStream("Amazon.Vps.Init.sh")
            ?? throw new InvalidOperationException("Embedded init.sh was not found.");
        using var reader = new StreamReader(stream);
        var userData = reader.ReadToEnd()
            .Replace("__SSH_PORT__", sshPort.ToString(CultureInfo.InvariantCulture),
                StringComparison.Ordinal);

        var vps = new Aws.LightSail.Instance(name, new Aws.LightSail.InstanceArgs
        {
            AvailabilityZone = "us-east-2a",
            BlueprintId = "amazon_linux_2023",
            BundleId = "medium_3_0",
            IpAddressType = "dualstack",
            Name = name,
            KeyPairName = lightsailKey.Name,
            UserData = userData
        }, new CustomResourceOptions
        {
            Parent = this,
            DeleteBeforeReplace = true,
            ReplaceOnChanges = { "userData" }
        });

        var publicPorts = new Aws.LightSail.InstancePublicPorts($"{name}-ports", new()
        {
            InstanceName = vps.Name,
            PortInfos =
            {
                new Aws.LightSail.Inputs.InstancePublicPortsPortInfoArgs
                {
                    Protocol = "tcp",
                    FromPort = sshPort,
                    ToPort = sshPort,
                    Cidrs = { "0.0.0.0/0" },
                    Ipv6Cidrs = { "::/0" }
                },
                new Aws.LightSail.Inputs.InstancePublicPortsPortInfoArgs
                {
                    Protocol = "tcp",
                    FromPort = 80,
                    ToPort = 80,
                    Cidrs = { "0.0.0.0/0" },
                    Ipv6Cidrs = { "::/0" }
                }
            }
        }, new CustomResourceOptions
        {
            Parent = this
        });

        InstanceId = vps.Id;
        InstanceArn = vps.Arn;
        PublicIpAddress = vps.PublicIpAddress;
        Username = Output.Create("dev");
        PrivateKey = keys.PrivateKeyValue;
        SshPort = Output.Create(sshPort);

        RegisterOutputs(new Dictionary<string, object?>
        {
            ["instanceId"] = InstanceId,
            ["instanceArn"] = InstanceArn,
            ["publicIpAddress"] = PublicIpAddress,
            ["username"] = Username,
            ["privateKey"] = PrivateKey,
            ["sshPort"] = SshPort
        });

    }

}
