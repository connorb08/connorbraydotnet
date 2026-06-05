using Queens.Enums;

namespace Queens.Core.Variables;

public sealed class Column(ILogger<Column> logger, int id) : CellGroup(logger, id)
{
    public override CellGrouping Grouping => CellGrouping.Column;

    public override bool LocalSearch()
    {

        logger.AnalyzeGroup(this);

        if (Cells.Count() == 1)
        {
            var cell = Cells.First();
            cell.SetQueen(true, $"Column {Id} only has one cell left");
            return true;
        }

        if (Colors.Count() == 1)
        {
            Color color = Colors.First();
            bool trimmed = color.FilterOut(c => c.Column != this, $"Queen for {color.ColorName} must be in Column {Id}");
            if (trimmed)
            {
                return true;
            }
        }

        return RemoveSharedEdges();
    }

    private bool RemoveSharedEdges()
    {
        var edgeSets = Cells.Select(c => c.Edges.Where(e => e.Column != this).ToHashSet());
        var intersection = edgeSets.Aggregate((set1, set2) => [.. set1.Intersect(set2)]);

        bool trimmed = intersection.Count > 0;
        foreach (var cell in intersection)
        {
            logger.LogInformation("Column {Id} removing shared edge Cell {CellId}", Id, cell.Id);
            cell.SetQueen(false, "Reason-433");
        }

        return trimmed;
    }
}
