using System.Text.RegularExpressions;

namespace Queens.Extensions;

internal static class StringExtensions
{
    extension(string str)
    {
        internal Match Match(Regex regex) => regex.Match(str);
    }
}
