import { assert, describe, expect, it, vi } from "vitest";
import { ValidateResume } from "../../src/validate";

vi.mock("#validator");

describe("Validate should handle missing error", () => {
	it("should return generic error", async () => {
		const resume = {};
		const result = ValidateResume(resume);
		assert.isFalse(result.ok);
		assert.isArray(result.errors, "Errors should be an array");
		assert.lengthOf(result.errors, 1);
		expect(result.errors).toContain("Unknown Error Validating");
	});
});
