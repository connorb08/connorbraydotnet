import { ValidateResume } from "#validate";
import { ValidateTestData } from "#test/validation-tests";

describe.concurrent("Resume Validation", () => {
	Object.entries(ValidateTestData(ValidateResume)).forEach(
		([should, assert]) => {
			it(should, assert);
		},
	);

	it("should have errors for invalid data", async () => {
		const data = {};
		const { ok, error } = await ValidateResume(data);
		assert.isFalse(ok);
		expect(error)
			.to.be.a("string")
			.has.length.greaterThan(0, "Error length should be > 0");
	});
});
