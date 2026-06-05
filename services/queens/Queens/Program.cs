using Microsoft.Extensions.Configuration.EnvironmentVariables;
using Microsoft.Extensions.Configuration.Json;
using Microsoft.Extensions.Hosting;

namespace Queens;

public class Program
{
    public static async Task Main(string[] args)
    {
        string environment = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? Environments.Development;
        await BuildHost(args, environment)
            .LoadAndRegisterConfig()
            .AddLogging()
            .RegisterServices()
            .Build()
            .RunAsync();
    }

    private static HostApplicationBuilder BuildHost(string[] args, string environment) => Host.CreateEmptyApplicationBuilder(new()
    {
        ApplicationName = "Queens.Net",
        EnvironmentName = environment,
        Args = args,
        Configuration = new()
        {
            Sources = {
                new JsonConfigurationSource
                {
                    Path = $"appsettings.json",
                    Optional = false,
                    ReloadOnChange = true,
                },
                new JsonConfigurationSource
                {
                    Path = $"appsettings.{environment}.json",
                    Optional = false,
                    ReloadOnChange = true,
                },
                new EnvironmentVariablesConfigurationSource(),
            }
        }
    });
}
