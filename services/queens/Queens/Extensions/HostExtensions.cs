using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using Queens.Core;
using Queens.Models.Database;
using Queens.Services;

namespace Queens.Extensions;

internal static class HostExtensions
{

    extension(HostApplicationBuilder builder)
    {
        internal HostApplicationBuilder RegisterServices()
        {
            builder.Services
                .AddSingleton<Factory>()
                .AddSingleton<WebScraper>()
                .AddSingleton<Game>()
                .AddSingleton<Definition>()
                .AddSingleton<Solution>()
                .AddSingleton<Logs>()
                .AddSingleton<Publisher>()
                .AddSingleton<Solver>()
                .AddSingleton<Graph>()
                .AddHostedService<Controller>();
            return builder;
        }

        internal HostApplicationBuilder LoadAndRegisterConfig()
        {
            builder.Services.AddSingleton<IConfig>(builder.Configuration.Get<Config>());
            return builder;
        }

        internal HostApplicationBuilder AddLogging()
        {
            StringLoggerProvider stringLoggerProvider = new();
            builder.Services.AddSingleton(stringLoggerProvider);
            builder.Services.AddLogging(config =>
            {
                config.ClearProviders();
                config.AddConfiguration(builder.Configuration.GetSection("Logging"));
                config.AddConsole();
                config.AddProvider(stringLoggerProvider);
            });
            return builder;
        }
    }
}
