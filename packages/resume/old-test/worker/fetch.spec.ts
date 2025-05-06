// @ts-ignore
import WorkerMainEntrypoint from "../../build/server";
import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";

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

describe("Mocked Cloudflare Worker Should Fetch", () => {
	//#region Mocks
	beforeAll(() => {
		vi.mock("react-router", async (importOriginal) => {
			return {
				...(await importOriginal<typeof import("react-router")>()),
				createRequestHandler: () => {
					return async (
						request: Request,
						context: {
							cloudflare: {
								env: Env;
								ctx: ExecutionContext;
							};
						},
					) => {
						const url = new URL(request.url);
						switch (url.pathname) {
							case "/":
								return new Response("Index Path", {
									status: 200,
									statusText: "OK",
								});
							case "/hello-world":
								return new Response(context.cloudflare.env.HELLO_WORLD);
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
	});
	//#endregion

	it("Should return a response", async () => {
		// Setup
		const request = new Request("http://example.com");
		const ctx = createExecutionContext();

		// Execute
		const res = await SELF.fetch(request);
		const body = await res.text();
		await waitOnExecutionContext(ctx);

		// Assert
		assert.instanceOf(res, Response);
		assert.isTrue(res.ok);
		expect(res.status).toBe(200);
		expect(body).toContain("Index Path");
	});

	it("Should get environment variable", async () => {
		// Setup
		const request = new Request("http://example.com/hello-world");
		const ctx = createExecutionContext();

		// Execute
		const res = await SELF.fetch(request);
		const body = await res.text();
		await waitOnExecutionContext(ctx);

		// Assert
		assert.instanceOf(res, Response);
		assert.isTrue(res.ok);
		expect(res.status).toBe(200);
		expect(body).toContain("Hello, world!");
	});
});
