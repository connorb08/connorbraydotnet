using Microsoft.Extensions.DependencyInjection;

using Queens.Core;
using Queens.Models;
using Queens.Models.Database;
using Queens.Services;

namespace Tests.Core;

public class GraphTests
{
    private readonly Factory _factory = new(
        new ServiceCollection()
            .AddLogging()
            .AddSingleton<Solution>()
            .BuildServiceProvider()
    );
    // private readonly Definition _definition = new()
    // {
    //     SideLength = 4,
    //     Colors = [
    //             new ColorData()
    //             {
    //                 Id = 0,
    //                 Name = "Red",
    //                 RGB = "rgb(255,0,0)"
    //             },
    //             new ColorData()
    //             {
    //                 Id = 1,
    //                 Name = "Green",
    //                 RGB = "rgb(0,255,0)"
    //             },
    //             new ColorData()
    //             {
    //                 Id = 2,
    //                 Name = "Blue",
    //                 RGB = "rgb(0,0,255)"
    //             },
    //             new ColorData()
    //             {
    //                 Id = 3,
    //                 Name = "Yellow",
    //                 RGB = "rgb(255,255,0)"
    //             }
    //         ],
    //     CellColors = [
    //             0,0,0,0,
    //             0,0,1,1,
    //             2,2,2,2,
    //             2,2,3,3
    //         ]
    // };

    // [Fact(Skip = "Not applicable after changing IEnumerable to IReadOnlySet")]
    // public void GraphRows_ShouldNotIterate_WhenSatisified()
    // {

    //     Graph graph = _factory.CreateGraph();

    //     foreach (var row in graph.Rows)
    //     {
    //         foreach (var cell in graph.Rows.ElementAt(1).Cells)
    //         {
    //             cell.SetQueen(true, "Test");
    //         }
    //         Assert.NotEqual(1, row.Id);
    //     }
    // }

    // todo: serializable error warning
    [Theory]
    [ClassData(typeof(GraphTestData))]
    public void Graph_WhenConstructed_ShouldConnectCorners(Graph graph, Dictionary<int, int[]> expectedEdges)
    {

        foreach (var cell in graph.Cells)
        {
            if (expectedEdges.TryGetValue(cell.Id, out var expectedEdgeIds))
            {
                var actualEdgeIds = cell.Edges.Select(e => e.Id).ToArray();
                Array.Sort(actualEdgeIds);
                Array.Sort(expectedEdgeIds);
                Assert.Equal(expectedEdgeIds, actualEdgeIds);
            }
        }
    }
}
