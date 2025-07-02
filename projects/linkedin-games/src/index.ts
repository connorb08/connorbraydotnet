import PlayQueens from "./queens/index.ts";
import PageController from "./queens/page-controller.ts";

await using pageController = await PageController();
await PlayQueens({ pageController });
