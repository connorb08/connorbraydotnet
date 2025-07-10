import PlayQueens from "./queens/index.ts";
import PageController from "./queens/page-controller/playwright.ts";

await using pageController = await PageController();
await pageController.start();
const queenLocations = await PlayQueens({ pageController });
console.log("Queen Locations:", queenLocations);