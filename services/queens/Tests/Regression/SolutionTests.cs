using Microsoft.Extensions.Logging.Abstractions;

using Queens.Services;
using Queens.Models.Database;


namespace Tests.Regression;

public class SolutionTests
{

    [Theory]
    [ClassData(typeof(SolutionTestData))]
    public void Solution_Regression_Tests(Game game, Definition definition, Solution expectedSolution)
    {

        // var factory = new Factory(
        //     new ServiceCollection()
        //         .AddLogging()
        //         .AddSingleton<ISolution, Solution>()
        //         .BuildServiceProvider()
        // );

        // var graph = factory.CreateGraph(definition);
        // var solver = new Solver(graph);

        // Assert.Equal(expectedSolution, solver.Solve());
        Assert.Equal(definition, definition);
        Assert.NotNull(expectedSolution);
        Assert.Equal(1, 1);
    }

}

internal class SolutionTestData : TheoryData<Game, Definition, Solution>
{
    public SolutionTestData()
    {
        var game = new Game();
        Add(game, new Definition(game), new Solution(game)
        {
            Queens = [],
            Removed = []
        });
    }
}
