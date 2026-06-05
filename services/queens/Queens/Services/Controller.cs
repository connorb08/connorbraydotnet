using Microsoft.Extensions.Hosting;

using Queens.Core;
using Queens.Models.Database;

namespace Queens.Services;

internal sealed class Controller(
    ILogger<Controller> logger,
    WebScraper scraper,
    IHostApplicationLifetime lifetime,
    Publisher publisher,
    Solver solver,
    Graph graph
) : BackgroundService
{

    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Controller started");
        await scraper.LoadGameDefinition();
        await graph.Create();
        await solver.Solve();
        await publisher.PublishSolution();
        logger.LogInformation("Controller finished");
        lifetime.StopApplication();
    }

}
