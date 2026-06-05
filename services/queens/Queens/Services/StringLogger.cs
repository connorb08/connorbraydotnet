using System.Collections.Concurrent;

namespace Queens.Services;

public class StringLoggerProvider : ILoggerProvider
{

    private readonly ConcurrentQueue<string> _logEntries = new();
    private bool _disposed;

    public string GetAllLogs() => string.Join(Environment.NewLine, _logEntries);
    public void Clear() => _logEntries.Clear();
    public ILogger CreateLogger(string categoryName)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
        return new StringLogger(categoryName, _logEntries);
    }

    private class StringLogger(string categoryName, ConcurrentQueue<string> logEntries) : ILogger
    {

        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            if (formatter == null) return;

            string message = formatter(state, exception);
            string logLine = $"[{logLevel}] {categoryName}: {message}";
            if (exception != null)
            {
                logLine += $"{Environment.NewLine}{exception}";
            }

            logEntries.Enqueue(logLine);
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed)
        {
            return;
        }

        if (disposing)
        {
            _logEntries.Clear();
        }

        _disposed = true;
    }
}
