using System.Text.Json;

namespace Queens.Extensions;

internal static class ObjectExtensions
{
    extension<T>(T obj)
    {
        internal string ToJson(JsonSerializerOptions? options = null) => JsonSerializer.Serialize(obj, options);
    }
}
