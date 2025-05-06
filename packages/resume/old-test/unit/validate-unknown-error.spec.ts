import { DeepCopy } from "#test/utils";
import { ValidateResume } from "#validate";

vi.mock("#validate/validate.js");

describe("Validate should handle missing error", () => {
	it("should return generic error", async () => {
		const resume = DeepCopy({});
		const result = await ValidateResume(resume);
		assert.isFalse(result.ok);
		assert.isString(result.error, "Error should be a string");
		expect(result.error).toContain("Error Validating");
	});
});
