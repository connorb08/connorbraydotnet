using System.Text.Json.Serialization;

namespace Queens.Models.Database;

public class SqlRequest
{
    [JsonPropertyName("sql")]
    public required string Sql { get; init; }

    [JsonPropertyName("params")]
    public required List<object> Parameters { get; init; }
}
