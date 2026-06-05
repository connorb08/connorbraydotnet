using Microsoft.Extensions.Hosting;

using Queens.Core;
using Queens.Models.Database;

namespace Queens.Services;

internal sealed class Solver(
    ILogger<Solver> logger,
    Definition definition,
    Graph graph
)
{

    public Task Solve() => Task.Run(() =>
    {

        int iteration = 0;
        int maxIterations = 1000;
        while (Search() && iteration < maxIterations)
        {
            iteration++;
        }

        var unsatisfied = graph.Cells.Select(c => c.Id);
        var queens = graph.Queens.Select(c => c.Id);
        var removed = graph.Removed.Select(c => c.Id);

        bool solved =
            !unsatisfied.Any() &&
            queens.Count() == definition.SideLength &&
            removed.Count() == definition.CellColors.Count - definition.SideLength;

        if (solved)
        {
            logger.WriteInformation($"Solution found in {iteration} iterations");
            logger.WriteInformation($"Queens: {string.Join(", ", queens)}");
        }
        else
        {
            logger.LogWarning("Failed to find a solution in {Iterations} iterations", iteration);
            logger.LogWarning("Unsatisfied cells: {Unsatisfied}", string.Join(", ", unsatisfied));
            logger.LogWarning("Queens: {Queens}", string.Join(", ", queens));
            logger.LogWarning("Removed: {Removed}", string.Join(", ", removed));
        }

    });

    private bool Search()
    {
        foreach (var row in graph.Rows)
            if (row.LocalSearch())
                return true;

        foreach (var col in graph.Columns)
            if (col.LocalSearch())
                return true;

        foreach (var color in graph.Colors)
            if (color.LocalSearch())
                return true;

        foreach (var colorCombination in graph.Colors.Combinations())
        {

            bool trimmed = false;

            int numberOfColors = colorCombination.Count;
            var rows = colorCombination.SelectMany(c => c.Cells).Select(c => c.Row).Distinct().ToHashSet();
            if (rows.Count == numberOfColors)
            {
                foreach (var row in rows)
                {
                    trimmed |= row.FilterOut(c => !colorCombination.Contains(c.Color), "Color combination mismatch");
                }
            }

            var columns = colorCombination.SelectMany(c => c.Cells).Select(c => c.Column).Distinct().ToHashSet();
            if (columns.Count == numberOfColors)
            {
                foreach (var column in columns)
                {
                    trimmed |= column.FilterOut(c => !colorCombination.Contains(c.Color), "Color combination mismatch");
                }
            }

            if (trimmed)
                return true;
            else
                continue;
        }

        return false;
    }

}
