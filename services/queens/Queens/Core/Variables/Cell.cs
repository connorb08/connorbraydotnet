using Queens.Models.Database;

namespace Queens.Core.Variables;


public interface ICell
{
    public int Id { get; }
    public bool Satisfied { get; }
    public bool IsQueen { get; }
    public IEnumerable<ICell> Edges { get; }

    public Row Row { get; }
    public Column Column { get; }
    public Color Color { get; }


    /// <summary>
    /// Adds the specified element to a set.
    /// </summary>
    /// <param name="cell"></param>
    /// <returns>
    /// true if a new connection is made between either of the cells; false if both cells are already connected.
    /// </returns>
    public void AddCorner(ICell cell);
    public void SetQueen(bool isQueen, string reason);

}

internal sealed class Cell(ILogger<Cell> logger, Solution solution, int id, ICellGroup row, ICellGroup column, ICellGroup color) : ICell
{

    // #region Fields

    private readonly ICellGroup _row = row;
    private readonly ICellGroup _column = column;
    private readonly ICellGroup _color = color;
    private readonly HashSet<ICell> _corners = [];
    private bool? _isQueen = null;

    // #endregion

    // #region Properties

    public int Id { get; } = id;
    public bool Satisfied => _isQueen.HasValue;
    public bool IsQueen => _isQueen.HasValue && _isQueen.Value;
    public IEnumerable<ICell> Edges => _corners
        .Concat(_row.Cells)
        .Concat(_column.Cells)
        .Concat(_color.Cells)
        .Where(cell => cell.Id != Id && !cell.Satisfied)
        .Distinct();

    public Row Row => (Row)_row;
    public Column Column => (Column)_column;
    public Color Color => (Color)_color;

    // #endregion

    // #region Methods

    public void AddCorner(ICell cell)
    {
        _corners.Add(cell);
    }

    public void SetQueen(bool shouldPlaceQueen, string reason)
    {
        if (_isQueen is not null)
        {
            logger.LogWarning("Cell {Id} is already set as a queen: {IsQueen}", Id, _isQueen);
            return;
        }

        _isQueen = shouldPlaceQueen;

        if (shouldPlaceQueen)
        {
            solution.Queens.Add(this.Id);
            logger.PlaceQueen(Id, reason);
            foreach (var cell in Edges)
                cell.SetQueen(false, $"Cell cannot be a queen because it is an edge of Cell {Id}");
        }
        else
        {
            solution.Removed.Add(this.Id);
            logger.PlaceCross(Id, reason);
        }

    }

    // #endregion

}
