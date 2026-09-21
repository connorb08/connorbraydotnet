import { createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { assert, describe, expect, it } from "vitest";
// @ts-expect-error Importing the worker main entrypoint may not have proper TypeScript types
import WorkerMainEntrypoint from "../../build/server";

describe("Built Cloudflare Worker Should Fetch", () => {
	it("Should return a response", async () => {
		const request = new Request("http://example.com");
		const ctx = createExecutionContext();

		const worker = new WorkerMainEntrypoint(ctx, {});
		const res = await worker.fetch(request);
		const body = await res.text();
		await waitOnExecutionContext(ctx);

		assert.instanceOf(res, Response);
		assert.isTrue(res.ok);
		expect(res.status).toBe(200);
		expect(body).toContain("Connor Bray");
	});
});
