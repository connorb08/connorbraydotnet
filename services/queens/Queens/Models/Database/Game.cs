namespace Queens.Models.Database;

public class Game
{

    /// <summary>
    /// UUID7
    /// </summary>
    public string Id { get; } = Guid.CreateVersion7().ToString();

    /// <summary>
    /// Unix epoch time
    /// </summary>
    public long Date { get; } = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

    public SqlRequest SqlRequest() => new()
    {
        Sql = $"INSERT INTO Queens_Game (Id, Date) VALUES (?, ?);",
        Parameters = [
            Id,
            Date
        ]
    };

}
