using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

using Queens.Models.Database;

namespace Queens.Services;

public sealed class Publisher(
    ILogger<Publisher> logger,
    IConfig config,
    Game game,
    Definition definition,
    Solution solution,
    Logs logs
) : IDisposable
{
    private bool _disposed;
    private readonly Uri _uri = new($"https://api.cloudflare.com/client/v4/accounts/{config.Cloudflare.AccountId}/d1/database/{config.Cloudflare.DatabaseId}/raw");
    private readonly HttpClient _httpClient = new()
    {
        DefaultRequestHeaders =
        {
            Authorization = new AuthenticationHeaderValue("Bearer", config.Cloudflare.ApiToken),
        },
    };

    private class BatchSqlRequest
    {
        [JsonPropertyName("batch")]
        public List<SqlRequest> Batch { get; init; } = [];
    }

    public async Task PublishSolution()
    {
        HttpResponseMessage? response = null;
        try
        {
            BatchSqlRequest req = new()
            {
                Batch = [
                    game.SqlRequest(),
                    definition.SqlRequest(),
                    solution.SqlRequest(),
                    logs.SqlRequest()
                ]
            };

            response = await _httpClient.PostAsJsonAsync(_uri, req);
            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync();
            logger.LogInformation($"Response: {responseBody}");
        }
        catch (Exception ex)
        {
            Environment.ExitCode = 99;
            logger.LogError(ex, "An error occurred while publishing the solution.");
            if (response is not null)
            {
                string responseBody = await response.Content.ReadAsStringAsync();
                logger.LogError($"Response: {responseBody}");
            }
            return;
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    private void Dispose(bool shouldDispose)
    {
        if (!_disposed)
        {
            if (shouldDispose)
            {
                _httpClient?.Dispose();
            }
            _disposed = true;
        }
    }

}
