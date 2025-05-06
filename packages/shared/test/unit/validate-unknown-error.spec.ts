import { assert, describe, expect, it, vi } from "vitest";
import { ValidateResume } from "#validate";
import { DeepCopy } from "../utils";

vi.mock("#validators/resume");

describe("Validate should handle missing error", () => {
	it("should return generic error", async () => {
		const resume = DeepCopy({});
		const result = await ValidateResume(resume);
		assert.isFalse(result.ok);
		assert.isArray(result.errors, "Errors should be an array");
		expect(result.errors).toContain("Unknown Error Validating");
	});
});
