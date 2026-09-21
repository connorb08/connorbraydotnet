/** biome-ignore-all lint/style/noNonNullAssertion: Using non-null assertion to explicitly indicate that the variables will be initialized before use */
import { createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { env } from "cloudflare:workers";
import type { RouterContextProvider } from "react-router";
import { assert, describe, expect, it, vi } from "vitest";
import { cfContext } from "#context";
import WorkerEntrypoint from "#worker";

vi.mock("react-router", async (importOriginal) => {
	return {
		...(await importOriginal<typeof import("react-router")>()),
		createRequestHandler: () => {
			return async (request: Request, context: RouterContextProvider) => {
				const url = new URL(request.url);
				switch (url.pathname) {
					case "/":
						return new Response("Index Path", {
							status: 200,
							statusText: "OK",
						});
					case "/hello-world":
						return new Response(context.get(cfContext).env.HELLO_WORLD);
					default:
						return new Response("Not Found", {
							status: 404,
							statusText: "Not Found",
						});
				}
			};
		},
	};
});

describe("Worker Fetch", () => {
	let worker: WorkerEntrypoint = null!;
	let ctx: ExecutionContext = null!;

	beforeEach(() => {
		ctx = createExecutionContext();
		worker = new WorkerEntrypoint(ctx, env);
	});

	afterEach(() => {
		ctx = null!;
		worker = null!;
	});

	afterAll(() => {
		vi.resetAllMocks();
	});

	it("Should Return a Response", async () => {
		// Setup
		const request = new Request("http://example.com");

		// Execute
		const res = await worker.fetch(request);
		const body = await res.text();
		await waitOnExecutionContext(ctx);

		// Assert
		assert.instanceOf(res, Response);
		assert.isTrue(res.ok);
		expect(res.status).toBe(200);
		expect(body).toContain("Index Path");
	});

	it("Should get Environment Variable", async () => {
		// Setup
		const request = new Request("http://example.com/hello-world");

		// Execute
		const res = await worker.fetch(request);
		const body = await res.text();
		await waitOnExecutionContext(ctx);

		// Assert
		assert.instanceOf(res, Response);
		assert.isTrue(res.ok);
		expect(res.status).toBe(200);
		expect(body).toContain("Hello, world!");
	});
});
