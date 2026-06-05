using Queens.Extensions;

using Shouldly;

namespace Tests.Extensions;

public class SetExtensionsTests
{
    [Fact]
    public void Combinations_WhenEmpty_ReturnsEmpty()
    {
        IReadOnlySet<int> set = new HashSet<int>();

        var actual = set.Combinations().ToList();

        Assert.Empty(actual);
    }

    [Fact]
    public void Combinations_WhenThreeItems_ReturnsAllNonEmptySubsets()
    {
        IReadOnlySet<int> set = new HashSet<int> { 1, 2, 3, 4 };

        var actual = set.Combinations().ToList();

        var expected = new List<IReadOnlySet<int>>
        {
            new HashSet<int> { 1, 2 },
            new HashSet<int> { 1, 3 },
            new HashSet<int> { 1, 4 },
            new HashSet<int> { 2, 3 },
            new HashSet<int> { 2, 4 },
            new HashSet<int> { 3, 4 },
            new HashSet<int> { 1, 2, 3 },
            new HashSet<int> { 1, 2, 4 },
            new HashSet<int> { 1, 3, 4 },
            new HashSet<int> { 2, 3, 4 }
        };

        Assert.Equal(expected.Count, actual.Count);
        foreach (var expectedSet in expected)
        {
            Assert.Contains(actual, actualSet => actualSet.SetEquals(expectedSet));
        }
    }

    [Fact]
    public void Combinations_WhenLoopBreaks_ResetsEnumerator()
    {
        IReadOnlySet<int> set = new HashSet<int> { 1, 2, 3, 4 };

        foreach (var combination in set.Combinations())
        {
            if (combination.Count == 3)
            {
                break;
            }
        }

        set.Combinations().First().Count.ShouldBe(2);

    }
}
