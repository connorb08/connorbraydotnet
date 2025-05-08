import { expect, type PlaywrightTestArgs, test } from "@playwright/test";

test.describe("Page has title", () => {
	test("has title", async ({ context }: PlaywrightTestArgs) => {
		const page = await context.newPage();
		await page.goto("/");
		const title = await page.title();
		expect(title).toBe("Connor Bray Resume");
	});

	test.afterEach(async ({ page, context }, { status }) => {
		if (status === "failed") {
			await test.info().attach("screenshot", {
				body: await page.screenshot({ fullPage: true }),
				contentType: "image/png",
			});
		}
		await context.close();
	});
});
