namespace Queens.Extensions;

public static class SetExtensions
{
    extension<T>(IReadOnlySet<T> set)
    {
        public IEnumerable<IReadOnlySet<T>> Combinations()
        {
            int members = set.Count;
            int choose = 2;
            while (choose < members)
            {
                foreach (var combination in Combine(set, choose))
                {
                    yield return combination;
                }
                choose++;
            }
        }
    }

    private static IEnumerable<IReadOnlySet<T>> Combine<T>(IReadOnlySet<T> nums, int choose)
    {
        if (choose < 1 || choose > nums.Count)
        {
            yield break;
        }

        var items = new List<T>(nums);

        foreach (var combination in CombineFrom(0, choose, []))
        {
            yield return combination;
        }

        IEnumerable<IReadOnlySet<T>> CombineFrom(int start, int needed, List<T> current)
        {
            if (needed == 0)
            {
                yield return new HashSet<T>(current);
                yield break;
            }

            int maxStart = items.Count - needed;
            for (int i = start; i <= maxStart; i++)
            {
                current.Add(items[i]);
                foreach (var combination in CombineFrom(i + 1, needed - 1, current))
                {
                    yield return combination;
                }
                current.RemoveAt(current.Count - 1);
            }
        }
    }
}
