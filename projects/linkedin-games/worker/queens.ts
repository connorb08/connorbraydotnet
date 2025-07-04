// import PlayQueens from "#src/queens/index.ts";
// import PageController from "#src/queens/cf-page-controller.ts";
import { launch, type BrowserWorker } from "@cloudflare/playwright";

// export async function getQueenLocations(browser: BrowserWorker): Promise<number[]> {
//     await using pageController = await PageController(browser);
//     const queenLocations = await PlayQueens({ pageController });
//     return queenLocations;
// }

const url = "https://www.linkedin.com/games/view/queens/desktop";

export async function testBrowser(browserWorker: BrowserWorker): Promise<string> {
    try {
        const url = "https://www.linkedin.com/games/view/queens/desktop";
        const browser = await launch(browserWorker);
        // const context = await browser.newContext();

        // await context.route("**.jpg", (route) => route.abort());
        // const page = await context.newPage();
        const page = await browser.newPage();
        await page.goto(url);
        await page.locator("button#launch-footer-start-button").click();
        const content = await page.locator('button[aria-label="Dismiss"]').textContent();

        return content ?? "No content found";
    } catch (error) {
        console.error("Error in testBrowser:", error);
        return "Error occurred while testing browser";
    }
    
}