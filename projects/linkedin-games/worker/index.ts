import {launch} from "@cloudflare/playwright";

export default {
	async fetch(request, env, ctx): Promise<Response> {
		try {
        const url = "https://www.linkedin.com/games/view/queens/desktop";
        const browser = await launch(env.BROWSER);
        const context = await browser.newContext();

		context.setDefaultTimeout(100);

        await context.route("**.jpg", (route) => route.abort());
        const page = await context.newPage();
        await page.goto(url);
        await page.locator("button#launch-footer-start-button").click();
        const content = await page.locator('button[aria-label="Dismiss"]').textContent();

        const text =  content || "No content found";
		return new Response(text);
    } catch (error) {
        console.error("Error in testBrowser:", error);
        return new Response("Error occurred while testing browser");
    }
    
	},
} satisfies ExportedHandler<Env>;
