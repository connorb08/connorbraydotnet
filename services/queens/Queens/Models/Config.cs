namespace Queens;

public interface IConfig
{
    public string PageURL { get; }
    public CloudflareConfig Cloudflare { get; }
    public BrowserConfig Browser { get; }
}

public readonly record struct CloudflareConfig
{
    public string AccountId { get; init; }
    public string DatabaseId { get; init; }
    public string ApiToken { get; init; }
}

public readonly record struct BrowserConfig
{
    public string UserAgent { get; init; }
    public bool Headless { get; init; }

}

internal readonly record struct Config : IConfig
{
    public string PageURL { get; init; }
    public CloudflareConfig Cloudflare { get; init; }
    public BrowserConfig Browser { get; init; }
}
