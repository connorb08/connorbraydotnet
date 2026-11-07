using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure;

public static class Program
{
    public static Task<int> Main(string[] args) => Deployment.RunAsync(() =>
    {

        var builder = Host.CreateApplicationBuilder(args);
        builder.Configuration.AddEnvironmentVariables();
        builder.Logging.AddSimpleConsole();
        builder.Services.AddSingleton<BackendState>();
        var host = builder.Build();

        var backendState = host.Services.GetRequiredService<BackendState>();
        var backendOutput = backendState.Output();

        return backendOutput;

        // var vps = new Aws.LightSail.Instance("myVps", new Aws.LightSail.InstanceArgs
        // {
        //     Region = "us-east-2",
        //     AvailabilityZone = "us-east-2a",
        //     BlueprintId = "amazon_linux_2023",
        //     BundleId = "small_3_0",
        //     IpAddressType = "Dualstack",
        //     Name = "VPS"
        // });

    });
}
