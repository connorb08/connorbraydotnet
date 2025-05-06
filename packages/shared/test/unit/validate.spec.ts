import { assert, describe, expect, it } from "vitest";
import { ValidateResume } from "#validate";
import { ValidateTestData } from "../validation-tests";

describe.concurrent("Resume Validation", () => {
	Object.entries(ValidateTestData(ValidateResume)).forEach(
		([should, assert]) => {
			it(should, assert);
		},
	);

	it("should have errors for invalid data", async () => {
		const data = {};
		const { ok, errors } = await ValidateResume(data);
		assert.isFalse(ok);
		expect(errors)
			.to.be.an("array")
			.has.length.greaterThan(0, "Error length should be > 0");
	});
});
