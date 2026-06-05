using System.Collections.Concurrent;
using System.Text.RegularExpressions;

using Microsoft.Playwright;

using Queens.Models.Database;

namespace Queens.Services;

internal static partial class RegexPatterns
{
    [GeneratedRegex(@"of color\s*([^,]+)", RegexOptions.IgnoreCase)]
    internal static partial Regex AriaLabelRegex();

    [GeneratedRegex(@"cell-color-(\d+)", RegexOptions.IgnoreCase)]
    internal static partial Regex CellColorIdRegex();
}

internal sealed class WebScraper(ILogger<WebScraper>? logger, IConfig config, Definition definition) : IAsyncDisposable
{

    private readonly ILogger<WebScraper>? _logger = logger;
    private readonly Regex _ariaLabelRegex = RegexPatterns.AriaLabelRegex();
    private readonly Regex _cellColorIdRegex = RegexPatterns.CellColorIdRegex();
    private bool _disposed;
    private IPlaywright _playwright = null!;
    private IBrowser _browser = null!;
    private IBrowserContext _context = null!;
    private IPage _page = null!;

    public async Task LoadGameDefinition()
    {
        await LaunchBrowserAsync();
        await StartGameAsync();
        await ParseGameDefinitionAsync();
    }

    private async Task LaunchBrowserAsync()
    {
        _playwright = await Playwright.CreateAsync();
        _browser = await _playwright.Chromium.LaunchAsync(new()
        {
            Headless = config.Browser.Headless,
            Args = [
                "--no-sandbox",
                // "--headless",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-zygote",
                "--disable-web-security",
                "--disable-features=IsolateOrigins,site-per-process",
                "--disable-site-isolation-trials",
                "--disable-features=site-per-process",
                "--disable-accelerated-2d-canvas",
                "--disable-background-timer-throttling",
                "--disable-backgrounding-occluded-windows",
                "--disable-renderer-backgrounding",
                "--disable-features=TranslateUI",
                "--disable-ipc-flooding-protection",
                "--disable-default-apps",
                // "--user-data-dir=/tmp/chrome-user-data",
                "--window-size=1920,1080",
            ]
        });
        _context = await _browser.NewContextAsync(new()
        {
            UserAgent = config.Browser.UserAgent
        });
        _page = await _context.NewPageAsync();
    }

    private async Task StartGameAsync()
    {
        await _page.GotoAsync(config.PageURL);

        await _page
                .GetByRole(AriaRole.Button)
                .Filter(new() { HasTextString = "Start" }).First
                .ClickAsync();
    }

    private async Task ParseGameDefinitionAsync()
    {
        var tableCells = await _page.QuerySelectorAllAsync("div.queens-cell-with-border");
        var colors = new ConcurrentDictionary<int, ColorData>();
        var cellsInfo = await Task.WhenAll(
            tableCells.Select(async (cell) =>
            {
                var cellIdx = cell.EvaluateAsync<string>("e => e.getAttribute('data-cell-idx')");
                var cellClass = cell.EvaluateAsync<string>("e => e.getAttribute('class')");
                var ariaLabel = cell.EvaluateAsync<string>("e => e.getAttribute('aria-label')");
                var colorValue = cell.EvaluateAsync<string>("e => window.getComputedStyle(e).backgroundColor");

                string?[] values = await Task.WhenAll(cellIdx, cellClass, ariaLabel, colorValue);

                if (!ushort.TryParse(values[0], out var cellId)) throw new InvalidOperationException("Failed to parse cell index");
                var colorIdText = values[1]?.Match(_cellColorIdRegex)?.Groups[1]?.Value.Trim();
                if (!ushort.TryParse(colorIdText, out var colorId)) throw new InvalidOperationException("Failed to parse cell color");
                var colorName = values[2]?.Match(_ariaLabelRegex)?.Groups[1]?.Value.Trim() ?? throw new InvalidOperationException("Failed to parse color name");
                var colorRGB = values[3] ?? throw new InvalidOperationException("Failed to parse color value");

                colors.TryAdd(colorId, new ColorData
                {
                    Id = colorId,
                    Name = colorName,
                    RGB = colorRGB
                });

                return (cellId, colorId);
            })
        );

        definition.SideLength = (ushort)Math.Sqrt(cellsInfo.Length);
        definition.Colors = [.. colors.Values];
        definition.CellColors = [.. cellsInfo.OrderBy(c => c.cellId).Select(c => c.colorId)];

        return;
    }

    public async ValueTask DisposeAsync()
    {
        if (_disposed) return;

        if (_page is not null)
        {
            await _page.CloseAsync();
        }

        if (_context is not null)
        {
            await _context.CloseAsync();
            await _context.DisposeAsync();
        }

        if (_browser is not null)
        {
            await _browser.CloseAsync();
            await _browser.DisposeAsync();
        }

        _playwright?.Dispose();
        _disposed = true;
    }
}
