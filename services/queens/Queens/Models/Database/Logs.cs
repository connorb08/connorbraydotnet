using Queens.Services;

namespace Queens.Models.Database;

public class Logs(Game game, StringLoggerProvider logger)
{
    private string GameId => game.Id;
    public string Text => logger.GetAllLogs();

    public SqlRequest SqlRequest() => new()
    {
        Sql = $"INSERT INTO Queens_Logs (GameId, Text) VALUES (?, ?);",
        Parameters = [
            GameId,
            Text
        ]
    };

}
