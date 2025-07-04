import PlayQueens from "./queens/index.ts";
import PageController from "./queens/page-controller.ts";

await using pageController = await PageController();
const queenLocations = await PlayQueens({ pageController });
console.log("Queen locations:", queenLocations);
