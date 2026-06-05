using System.Text.Json;

namespace Queens.Models.Database;

public readonly record struct ColorData
{
    public int Id { get; init; }
    public string Name { get; init; }
    public string RGB { get; init; }
}

public class Definition(Game game)
{
    private string GameId => game.Id;
    public int SideLength { get; set; }
    public List<ColorData> Colors { get; set; } = [];
    public List<int> CellColors { get; set; } = [];

    public SqlRequest SqlRequest() => new()
    {
        Sql = "INSERT INTO Queens_Definition (GameId, SideLength, Colors, CellColors) VALUES (?, ?, ?, ?);",
        Parameters = [
            GameId,
            SideLength,
            JsonSerializer.Serialize(Colors),
            JsonSerializer.Serialize(CellColors)
        ]
    };

}
