namespace Queens.Enums;

public enum CellGrouping
{
    Row,
    Column,
    Color
}

internal static class CellGroupingExtensions
{
    extension(CellGrouping group)
    {
        internal string Name => group.ToString();
    }
}
