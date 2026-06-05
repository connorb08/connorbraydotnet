using Queens.Enums;

namespace Queens.Core.Variables;

public sealed class Row(ILogger<Row> logger, int id) : CellGroup(logger, id)
{
    public override CellGrouping Grouping => CellGrouping.Row;

    public override bool LocalSearch()
    {
        logger.AnalyzeGroup(this);

        if (Cells.Count() == 1)
        {
            var cell = Cells.First();
            cell.SetQueen(true, $"Row {Id} only has one cell left");
            return true;
        }

        if (Colors.Count() == 1)
        {
            Color color = Colors.First();
            logger.LogInformation("All cells in Row {Id} are of color {Color}", Id, color.Id);
            bool trimmed = color.FilterOut(c => c.Row != this, "Reason-377593455");
            if (trimmed)
            {
                return true;
            }
        }

        return RemoveSharedEdges();
    }

    private bool RemoveSharedEdges()
    {
        var edgeSets = Cells.Select(c => c.Edges.Where(e => e.Row != this).ToHashSet());
        var intersection = edgeSets.Aggregate((set1, set2) => [.. set1.Intersect(set2)]);

        bool trimmed = intersection.Count > 0;
        foreach (var cell in intersection)
        {
            logger.LogInformation("Row {Id} removing shared edge Cell {CellId}", Id, cell.Id);
            cell.SetQueen(false, "Reason-4331221");
        }

        return trimmed;
    }
}
