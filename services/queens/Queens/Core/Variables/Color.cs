using Queens.Enums;

namespace Queens.Core.Variables;

public sealed class Color(ILogger<Color> logger, int id, string colorName) : CellGroup(logger, id, colorName)
{
    public override CellGrouping Grouping => CellGrouping.Color;

    public override bool LocalSearch()
    {

        logger.AnalyzeGroup(this);

        if (Cells.Count() == 1)
        {
            var cell = Cells.First();
            logger.LogInformation("Only one cell with color {ColorName} in the group", ColorName);
            cell.SetQueen(true, $"{ColorName} only has one cell left");
            return true;
        }

        if (Rows.Count() == 1)
        {
            Row row = Rows.First();
            bool trimmed = row.FilterOut(c => c.Color != this, $"This row must be {ColorName}");
            if (trimmed)
            {
                return true;
            }
        }

        if (Columns.Count() == 1)
        {
            Column column = Columns.First();
            bool trimmed = column.FilterOut(c => c.Color != this, $"This column must be {ColorName}");
            if (trimmed)
            {
                return true;
            }
        }

        return RemoveSharedEdges();
    }

    private bool RemoveSharedEdges()
    {
        var edgeSets = Cells.Select(c => c.Edges.Where(e => e.Color != this).ToHashSet());
        var intersection = edgeSets.Aggregate((set1, set2) => [.. set1.Intersect(set2)]);

        bool trimmed = intersection.Count > 0;
        foreach (var cell in intersection)
        {
            cell.SetQueen(false, $"Blocks a queen in {ColorName}({Id})");
        }

        return trimmed;
    }
}
