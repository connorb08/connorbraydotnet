using Queens.Enums;

namespace Queens.Core.Variables;

public interface ICellGroup
{

    public CellGrouping Grouping { get; }
    public IEnumerable<ICell> Cells { get; }
    public bool Satisfied { get; }
    public int Id { get; }
    public string? ColorName { get; }

    public IEnumerable<Row> Rows { get; }
    public IEnumerable<Column> Columns { get; }
    public IEnumerable<Color> Colors { get; }

    // #region Setup Methods

    public void AddCell(ICell cell);

    // #endregion

    /// <summary>
    /// Filters out the cell group based on specific criteria.
    /// </summary>
    /// <returns>True if a cell was removed.</returns>
    public bool FilterOut(Func<ICell, bool> predicate, string reason);

    public bool LocalSearch();

}

public abstract class CellGroup(ILogger<CellGroup> logger, int id, string? colorName = null) : ICellGroup
{

    private readonly HashSet<ICell> _cells = [];

    public abstract CellGrouping Grouping { get; }
    public int Id { get; } = id;
    public bool Satisfied => _cells.All(cell => cell.Satisfied);
    public string? ColorName => colorName;

    public IEnumerable<ICell> Cells => _cells.Where(cell => !cell.Satisfied);
    public IEnumerable<Row> Rows => Cells.Select(cell => cell.Row).Distinct();
    public IEnumerable<Column> Columns => Cells.Select(cell => cell.Column).Distinct();
    public IEnumerable<Color> Colors => Cells.Select(cell => cell.Color).Distinct();

    public abstract bool LocalSearch();

    public void AddCell(ICell cell)
    {
        ArgumentNullException.ThrowIfNull(cell);
        _cells.Add(cell);
    }

    public bool FilterOut(Func<ICell, bool> predicate, string reason)
    {
        ArgumentNullException.ThrowIfNull(predicate);
        var cellsToRemove = Cells.Where(predicate).ToList();
        foreach (var cell in cellsToRemove)
        {
            cell.SetQueen(false, reason);
        }
        return cellsToRemove.Count > 0;
    }
}
