using Microsoft.Extensions.DependencyInjection;

using Queens.Core;
using Queens.Models.Database;
using Queens.Services;
namespace Tests.Core;

public class GraphTestData : TheoryData<Graph, Dictionary<int, int[]>>
{

    private readonly Factory _factory = new(
        new ServiceCollection()
            .AddLogging()
            .AddSingleton<Solution>()
            .BuildServiceProvider()
    );

    private readonly Definition _definition = new(new Game())
    {
        SideLength = 4,
        Colors = [
                new ColorData()
                {
                    Id = 0,
                    Name = "Red",
                    RGB = "rgb(255,0,0)"
                },
                new ColorData()
                {
                    Id = 1,
                    Name = "Green",
                    RGB = "rgb(0,255,0)"
                },
                new ColorData()
                {
                    Id = 2,
                    Name = "Blue",
                    RGB = "rgb(0,0,255)"
                },
                new ColorData()
                {
                    Id = 3,
                    Name = "Yellow",
                    RGB = "rgb(255,255,0)"
                }
            ],
        CellColors = [
                0,0,0,0,
                0,0,1,1,
                2,2,2,2,
                2,2,3,3
            ]
    };

    // public GraphTestData()
    // {
    //     Add(_factory.CreateGraph(), new Dictionary<int, int[]>
    //     {
    //         { 0, [1, 2, 3, 4, 5, 8, 12] },
    //         { 1, [0, 2, 3, 4, 5, 6, 9, 13] },
    //         { 2, [0, 1, 3, 4, 5, 6, 7, 10, 14] },
    //         { 3, [0, 1, 2, 4, 5, 6, 7, 11, 15] }
    //     });
    // }
}
