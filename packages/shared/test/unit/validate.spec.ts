import { assert, describe, expect, it } from "vitest";
import { ResumeData } from "../../src/test-data";
import { DeepCopy } from "../../src/utils";
import { ValidateResume } from "../../src/validate";

describe.concurrent("Resume Validation", () => {
	it("should invalidate empty object", async () => {
		const resume = {};
		const result = ValidateResume(resume);
		assert.isFalse(result.ok);
		assert.isArray(result.errors, "Errors should be an array");
	});
	it("should invalidate undefined", async () => {
		const resume = undefined;
		assert.isFalse(ValidateResume(resume).ok);
	});
	it("should invalidate null", async () => {
		const resume = null;
		assert.isFalse(ValidateResume(resume).ok);
	});
	it("should invalidate missing phone number", async () => {
		const resume = DeepCopy(ResumeData);
		Reflect.deleteProperty(resume.about, "phoneNumber");
		assert.isFalse(ValidateResume(resume).ok);
	});
	it("should invalidate empty phone number", async () => {
		const resume = DeepCopy(ResumeData);
		resume.about.phoneNumber = "";
		assert.isFalse(ValidateResume(resume).ok);
	});
	it("should invalidate empty email", async () => {
		const resume = DeepCopy(ResumeData);
		resume.about.emailAddress = "";
		assert.isFalse(ValidateResume(resume).ok);
	});
	it("should invalidate invalid email", async () => {
		const resume = DeepCopy(ResumeData);
		resume.about.emailAddress = "ronald@mcdonalds";
		assert.isFalse(ValidateResume(resume).ok);
	});
	it("should invalidate additional property", async () => {
		const resume = DeepCopy(ResumeData);
		Object.assign(resume, { key: "value" });
		assert.isFalse(ValidateResume(resume).ok);
	});
	it("should validate full object", async () => {
		const resume = DeepCopy(ResumeData);
		assert.isTrue(ValidateResume(resume).ok);
	});

	it("should have errors for invalid data", async () => {
		const data = {};
		const { ok, errors } = await ValidateResume(data);
		assert.isFalse(ok);
		expect(errors).to.be.an("array").has.length.greaterThan(0, "Error length should be > 0");
	});
});
