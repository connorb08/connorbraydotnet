using System.Text.Json;

namespace Queens.Models.Database;

public class Solution(Game game)
{
    private string GameId => game.Id;
    public List<int> Queens { get; init; } = [];
    public List<int> Removed { get; init; } = [];

    public SqlRequest SqlRequest() => new()
    {
        Sql = $"INSERT INTO Queens_Solution (GameId, Queens, Removed) VALUES (?, ?, ?);",
        Parameters = [
            GameId,
            JsonSerializer.Serialize(Queens),
            JsonSerializer.Serialize(Removed)
        ]
    };

}
