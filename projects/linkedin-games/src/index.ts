import { ConfigSingleton } from "#config";
import PlayQueens from "./queens/index.ts";
import PageController from "./queens/page-controller/playwright.ts";

ConfigSingleton.env = process.env as Record<string, string>;
await using pageController = await PageController();
const queenLocations = await PlayQueens({ pageController });
console.log("Queen Locations:", queenLocations);
