using Queens.Core.Variables;
using Queens.Enums;

namespace Queens.Extensions;

internal static partial class LoggerExtensions
{

    private static class Events
    {
        public const int WriteInformation = 10;

        public const int AnalyzeGroup = 50;

        public const int RemoveCell = 99;
        public const int PlaceQueen = 100;
    }

    extension<T>(ILogger<T> logger)
    {
        internal void AnalyzeGroup(ICellGroup cellGroup)
        {
            string colorName = string.IsNullOrEmpty(cellGroup.ColorName) ? "" : $"({cellGroup.ColorName})";
            LogMessages.AnalyzeGroup(logger, cellGroup.Grouping.Name, cellGroup.Id, colorName);
        }
        internal void PlaceQueen(int cellId, string reason) => LogMessages.PlaceQueen(logger, cellId, reason);
        internal void PlaceCross(int cellId, string reason) => LogMessages.RemoveCell(logger, cellId, reason);
        internal void WriteInformation(string message) => LogMessages.WriteInformation(logger, message);
    }

    private static partial class LogMessages
    {
        [LoggerMessage(
            Level = LogLevel.Trace,
            EventId = Events.AnalyzeGroup,
            EventName = nameof(AnalyzeGroup),
            Message = "Analyzing {GroupName}({GroupId}){ColorName}"
        )]
        public static partial void AnalyzeGroup(ILogger logger, string groupName, int groupId, string colorName);

        [LoggerMessage(
            Level = LogLevel.Debug,
            EventId = Events.PlaceQueen,
            EventName = nameof(PlaceQueen),
            Message = "Placing Queen in cell {CellId}: {Reason}"
        )]
        public static partial void PlaceQueen(ILogger logger, int cellId, string reason);

        [LoggerMessage(
            Level = LogLevel.Debug,
            EventId = Events.RemoveCell,
            EventName = nameof(RemoveCell),
            Message = "Removing Cell({CellId}): {Reason}"
        )]
        public static partial void RemoveCell(ILogger logger, int cellId, string reason);

        [LoggerMessage(
            Level = LogLevel.Information,
            EventId = Events.WriteInformation,
            EventName = nameof(WriteInformation),
            Message = "{Message}"
        )]
        public static partial void WriteInformation(ILogger logger, string message);
    }
}
