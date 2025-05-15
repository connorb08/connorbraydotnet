import { SELF } from "cloudflare:test";
import { afterEach, assert, describe, expect, it, vi } from "vitest";
import type MainEntrypoint from "../../workers/main";

const mocks = vi.hoisted(() => ({
	validate: vi.fn(),
}));

vi.mock("shared", () => {
	return {
		ValidateResume: mocks.validate,
	};
});

describe("Worker Validate", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("Should return error for invalid data", async () => {
		// Setup
		mocks.validate.mockReturnValue({
			ok: false,
			errors: ["Invalid data"],
		});
		const worker = SELF as unknown as MainEntrypoint;

		// Execute
		const { ok, errors } = await worker.validate({});

		// Assert
		assert.isFalse(ok);
		assert.isArray(errors);
		assert.isTrue(errors.length > 0);
	});

	it("Should return error for invalid data", async () => {
		// Setup
		const originalConsoleError = console.error;
		console.error = vi.fn();
		mocks.validate.mockImplementation(() => {
			throw new Error("Throw Server Error");
		});
		// mocks.validate.mockRejectedValue(new Error("Throw Server Error"));
		const worker = SELF as unknown as MainEntrypoint;

		// Execute
		const { ok, errors } = await worker.validate({});

		// Assert
		assert.isFalse(ok);
		assert.isArray(errors);
		assert.isTrue(errors.length > 0);
		expect(errors).toContain("Unknown Server Error");
		console.error = originalConsoleError;
	});
});
