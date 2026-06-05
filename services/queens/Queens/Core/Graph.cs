using Queens.Core.Variables;
using Queens.Models.Database;
using Queens.Services;

namespace Queens.Core;

public class Graph(ILogger<Graph> logger, Factory factory, Definition definition)
{
    private readonly HashSet<ICell> _cells = [];
    private readonly HashSet<ICellGroup> _rows = [];
    private readonly HashSet<ICellGroup> _columns = [];
    private readonly HashSet<ICellGroup> _colors = [];

    public IReadOnlySet<ICell> Cells => _cells.Where(cell => !cell.Satisfied).ToHashSet().AsReadOnly();
    public IReadOnlySet<ICellGroup> Rows => _rows.Where(row => !row.Satisfied).ToHashSet().AsReadOnly();
    public IReadOnlySet<ICellGroup> Columns => _columns.Where(column => !column.Satisfied).ToHashSet().AsReadOnly();
    public IReadOnlySet<ICellGroup> Colors => _colors.Where(color => !color.Satisfied).ToHashSet().AsReadOnly();
    public IReadOnlySet<ICell> Removed => _cells.Where(cell => cell.Satisfied && !cell.IsQueen).ToHashSet().AsReadOnly();
    public IReadOnlySet<ICell> Queens => _cells.Where(cell => cell.Satisfied && cell.IsQueen).ToHashSet().AsReadOnly();

    public Task Create() => Task.Run(() =>
    {
        logger.LogInformation("Constructing graph with side length {SideLength}", definition.SideLength);
        for (int i = 0; i < definition.SideLength; i++)
        {
            string colorName = definition.Colors.First(c => c.Id == i).Name;
            _rows.Add(factory.CreateRow(_rows.Count));
            _columns.Add(factory.CreateColumn(_columns.Count));
            _colors.Add(factory.CreateColor(_colors.Count, colorName));
        }

        // var cellsById = new ICell[definition.CellColors.Length];
        for (int cellId = 0; cellId < definition.CellColors.Count; cellId++)
        {
            int rowId = cellId / definition.SideLength;
            int columnId = cellId % definition.SideLength;
            int colorId = definition.CellColors[cellId];

            var row = _rows.ElementAt(rowId);
            var column = _columns.ElementAt(columnId);
            var color = _colors.ElementAt(colorId);
            ICell cell = factory.CreateCell(cellId, row, column, color);

            _cells.Add(cell);
            row.AddCell(cell);
            column.AddCell(cell);
            color.AddCell(cell);
        }

        for (int cellId = 0; cellId < _cells.Count; cellId++)
        {
            int rowId = cellId / definition.SideLength;
            int columnId = cellId % definition.SideLength;
            ICell cell = _cells.ElementAt(cellId);

            // Add top-left corner if it exists
            if (rowId > 0 && columnId > 0)
            {
                int topLeftId = (rowId - 1) * definition.SideLength + (columnId - 1);
                ICell topLeftCell = _cells.ElementAt(topLeftId);
                cell.AddCorner(topLeftCell);
                topLeftCell.AddCorner(cell);
            }

            // Add top-right corner if it exists
            if (rowId > 0 && columnId < definition.SideLength - 1)
            {
                int topRightId = (rowId - 1) * definition.SideLength + (columnId + 1);
                ICell topRightCell = _cells.ElementAt(topRightId);
                cell.AddCorner(topRightCell);
                topRightCell.AddCorner(cell);
            }
        }
    });

    // internal Graph(ILogger<Graph> logger, Factory factory, Definition definition)
    // {
    //     logger.LogInformation("Constructing graph with side length {SideLength}", definition.SideLength);
    //     for (int i = 0; i < definition.SideLength; i++)
    //     {
    //         string colorName = definition.Colors.First(c => c.Id == i).Name;
    //         _rows.Add(factory.CreateRow(_rows.Count));
    //         _columns.Add(factory.CreateColumn(_columns.Count));
    //         _colors.Add(factory.CreateColor(_colors.Count, colorName));
    //     }

    //     // var cellsById = new ICell[definition.CellColors.Length];
    //     for (int cellId = 0; cellId < definition.CellColors.Count; cellId++)
    //     {
    //         int rowId = cellId / definition.SideLength;
    //         int columnId = cellId % definition.SideLength;
    //         int colorId = definition.CellColors[cellId];

    //         var row = _rows.ElementAt(rowId);
    //         var column = _columns.ElementAt(columnId);
    //         var color = _colors.ElementAt(colorId);
    //         ICell cell = factory.CreateCell(cellId, row, column, color);

    //         _cells.Add(cell);
    //         row.AddCell(cell);
    //         column.AddCell(cell);
    //         color.AddCell(cell);
    //     }

    //     for (int cellId = 0; cellId < _cells.Count; cellId++)
    //     {
    //         int rowId = cellId / definition.SideLength;
    //         int columnId = cellId % definition.SideLength;
    //         ICell cell = _cells.ElementAt(cellId);

    //         // Add top-left corner if it exists
    //         if (rowId > 0 && columnId > 0)
    //         {
    //             int topLeftId = (rowId - 1) * definition.SideLength + (columnId - 1);
    //             ICell topLeftCell = _cells.ElementAt(topLeftId);
    //             cell.AddCorner(topLeftCell);
    //             topLeftCell.AddCorner(cell);
    //         }

    //         // Add top-right corner if it exists
    //         if (rowId > 0 && columnId < definition.SideLength - 1)
    //         {
    //             int topRightId = (rowId - 1) * definition.SideLength + (columnId + 1);
    //             ICell topRightCell = _cells.ElementAt(topRightId);
    //             cell.AddCorner(topRightCell);
    //             topRightCell.AddCorner(cell);
    //         }
    //     }
    // }
}
