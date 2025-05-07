import {
	createExecutionContext,
	env,
	SELF,
	waitOnExecutionContext,
} from "cloudflare:test";
import { assert, beforeAll, describe, expect, it, vi } from "vitest";
import WorkerMainEntrypoint from "../build/server";

describe("Built Cloudflare Worker Should Fetch", () => {
	it("Should return a response", async () => {
		const request = new Request("http://example.com");
		const ctx = createExecutionContext();
		const worker = new WorkerMainEntrypoint(ctx, env);
		const res = await worker.fetch(request);
		const body = await res.text();
		await waitOnExecutionContext(ctx);

		assert.instanceOf(res, Response);
		assert.isTrue(res.ok);
		expect(res.status).toBe(200);
		expect(body).toContain("Connor Bray");
	});
	it("should add", () => {
		expect(1 + 1).toBe(2);
	});
});
