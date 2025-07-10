import { launch } from "@cloudflare/playwright";
import { DurableObject } from "cloudflare:workers";

export class Storage extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}
}

export default {
	async fetch(request, env, ctx): Promise<Response> {

		const browser = await launch(env.BROWSER);
		const page = await browser.newPage({
			userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3", viewport: {
				width: 1280,
				height: 800,
			}
		});

		await page.goto("https://www.linkedin.com/games/view/queens/desktop");

		const startButton = page.getByText("Start game");
		await startButton.waitFor({ timeout: 10000 });

		if (startButton) {
			console.log("Start button found, clicking...");
			await startButton.click();
		} else {
			console.log("Start button not found, cannot proceed.");
			return new Response("Start button not found", { status: 404 });
		}

		const tableCells = await page.locator("div.queens-cell-with-border").all();
		if (tableCells.length === 0) {
			console.error("No table cells found on the page.");
			return new Response("No table cells found", { status: 404 });
		}


		const graphData = [];

		for await (const cell of tableCells) {
			const [cellIdx, cellColor, ariaLabel] = await Promise.all([
				cell.getAttribute("data-cell-idx"),
				cell.getAttribute("class"),
				cell.getAttribute("aria-label"),
			]);
			graphData.push({
				id: +(cellIdx ?? -1),
				colorId: +(cellColor?.split("-").slice(-1)[0]?.trim() ?? -1),
				colorName: ariaLabel?.match(/of color\s*([^,]+)/i)?.[1]?.trim() ?? "",
			});
		}

		for await (const data of graphData) {
			console.log(`Cell ID: ${data.id}, Color ID: ${data.colorId}, Color Name: ${data.colorName}`);
		}
		const ss = await page.screenshot();

		return new Response(ss, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "no-cache",
			},
			status: 200,
		}
		);
	},
	async scheduled(controller, env, ctx) {
		try {
			const containerBinding = env.CONTAINER;
			const container = getContainer(containerBinding);
			const res = await container.fetch(new Request("http://connorbray.net"));
			// console.log("Scheduled event triggered");
			// const container = getContainer(env.CONTAINER);
			// const res = await container.fetch("http://connorbray.net:3000");
			console.log("Container response:", await res.text());
		} catch (error) {
			console.error("Error starting container:", error);
			throw error;
		}
	},
} satisfies ExportedHandler<Env>;
