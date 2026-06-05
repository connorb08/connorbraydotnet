using System.Diagnostics;

using Amazon.Lambda.Core;
using Amazon.Lambda.RuntimeSupport;
using Amazon.Lambda.Serialization.SystemTextJson;

namespace Lambda;

public class Payload
{
    public string[] Arguments { get; set; } = [];
}

public class Function
{
    /// <summary>
    /// The main entry point for the custom runtime.
    /// </summary>
    /// <param name="args">Command line arguments.</param>
    private static async Task Main(string[] args)
    {
        Func<Payload, ILambdaContext, Task<string>> handler = FunctionHandler;
        await LambdaBootstrapBuilder.Create(handler, new DefaultLambdaJsonSerializer())
            .Build()
            .RunAsync();
    }

    /// <summary>
    /// A simple function that takes a string and does a ToUpper
    ///
    /// To use this handler to respond to an AWS event, reference the appropriate package from 
    /// https://github.com/aws/aws-lambda-dotnet#events
    /// and change the string input parameter to the desired event type.
    /// </summary>
    /// <param name="input">The input to the Lambda function handler.</param>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public static async Task<string> FunctionHandler(Payload payload, ILambdaContext context)
    {
        var args = payload.Arguments;

        ProcessStartInfo startInfo = new()
        {
            FileName = "Queens",
            UseShellExecute = false,
            CreateNoWindow = true
        };

        try
        {
            using Process process = Process.Start(startInfo) ?? throw new InvalidOperationException("Failed to start process.");
            await process.WaitForExitAsync();
            if (process.ExitCode != 0)
            {
                context.Logger.LogError($"Process exited with code {process.ExitCode}");
                return $"Error: Process exited with code {process.ExitCode}";
            }
        }
        catch (Exception ex)
        {
            context.Logger.LogError($"Error executing assembly: {ex.Message}");
            return $"Error: {ex.Message}";
        }

        return "Success";
    }
}
