using Inf.Kubernetes.Charts;
using Inf.Kubernetes.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Org.Cdk8s;

namespace Inf.Kubernetes;

public static class Program
{
    public static async Task Main(string[] args)
    {

        var appProps = new AppProps()
        {
            Outdir = "out"
        };

        var builder = Host.CreateApplicationBuilder(args);
        builder.Configuration
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddJsonFile("secrets.json", optional: false, reloadOnChange: true)
            .AddEnvironmentVariables();
        builder.Logging.AddSimpleConsole();
        TailscaleConfig tsConfig = builder.Configuration.GetSection("Deployments:Tailscale").Get<TailscaleConfig>(binder => binder.ErrorOnUnknownConfiguration = true)
            ?? throw new InvalidOperationException($"The Deployments:Tailscale section is missing (Deployment__Tailscale__* environment variables).");
        tsConfig.Validate();
        builder.Services
            .AddSingleton(new App(appProps))
            .AddSingleton(tsConfig)
            .AddSingleton<TailscaleChart>();

        var host = builder.Build();

        var app = await host.Services.GetRequiredService<TailscaleChart>().BuildAsync();
        app.Synth();
    }
}
