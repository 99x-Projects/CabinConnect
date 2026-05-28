using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;

namespace CabinConnect.Api.Tests.Helpers;

public sealed class InMemoryLogCollector
{
    private readonly ConcurrentQueue<string> _messages = new();

    public void Add(string message)
    {
        _messages.Enqueue(message);
    }

    public IReadOnlyList<string> Snapshot()
    {
        return _messages.ToArray();
    }

    public void Clear()
    {
        while (_messages.TryDequeue(out _))
        {
        }
    }
}

public sealed class InMemoryLoggerProvider : ILoggerProvider
{
    private readonly InMemoryLogCollector _collector;

    public InMemoryLoggerProvider(InMemoryLogCollector collector)
    {
        _collector = collector;
    }

    public ILogger CreateLogger(string categoryName)
    {
        return new InMemoryLogger(categoryName, _collector);
    }

    public void Dispose()
    {
    }

    private sealed class InMemoryLogger : ILogger
    {
        private readonly string _categoryName;
        private readonly InMemoryLogCollector _collector;

        public InMemoryLogger(string categoryName, InMemoryLogCollector collector)
        {
            _categoryName = categoryName;
            _collector = collector;
        }

        public IDisposable BeginScope<TState>(TState state) where TState : notnull
        {
            return NullDisposable.Instance;
        }

        public bool IsEnabled(LogLevel logLevel)
        {
            return true;
        }

        public void Log<TState>(
            LogLevel logLevel,
            EventId eventId,
            TState state,
            Exception? exception,
            Func<TState, Exception?, string> formatter)
        {
            var message = formatter(state, exception);
            if (string.IsNullOrWhiteSpace(message))
            {
                return;
            }

            _collector.Add($"{_categoryName} [{logLevel}] {message}");
        }

        private sealed class NullDisposable : IDisposable
        {
            public static readonly NullDisposable Instance = new();

            public void Dispose()
            {
            }
        }
    }
}
