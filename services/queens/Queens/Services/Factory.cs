using Microsoft.Extensions.DependencyInjection;

using Queens.Core;
using Queens.Core.Variables;
using Queens.Models.Database;

namespace Queens.Services;

public class Factory(IServiceProvider serviceProvider)
{
    public ICell CreateCell(int id, ICellGroup row, ICellGroup column, ICellGroup color)
    {
        var logger = serviceProvider.GetRequiredService<ILogger<Cell>>();
        var solution = serviceProvider.GetRequiredService<Solution>();
        return new Cell(logger, solution, id, row, column, color);
    }

    public ICellGroup CreateRow(int id) => new Row(serviceProvider.GetRequiredService<ILogger<Row>>(), id);
    public ICellGroup CreateColumn(int id) => new Column(serviceProvider.GetRequiredService<ILogger<Column>>(), id);
    public ICellGroup CreateColor(int id, string colorName) => new Color(serviceProvider.GetRequiredService<ILogger<Color>>(), id, colorName);
}
