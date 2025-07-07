/** biome-ignore-all lint/suspicious/noExplicitAny: allow using any */

import { assert, type TestFunction } from "vitest";
import type { ValidationHandler } from "#types";
import { ResumeData } from "../";
import { DeepCopy } from "../src/utils";

interface ITestData {
	[TestDescription: string]: TestFunction<object>;
}

export const ValidateTestData = (validationHandler: ValidationHandler) => {
	return {
		"should invalidate empty object": async () => {
			const resume = {};
			const result = await validationHandler(resume);
			assert.isFalse(result.ok);
			assert.isArray(result.errors, "Errors should be an array");
		},
		"should invalidate undefined": async () => {
			const resume = undefined;
			assert.isFalse((await validationHandler(resume)).ok);
		},
		"should invalidate null": async () => {
			const resume = null;
			assert.isFalse((await validationHandler(resume)).ok);
		},
		"should invalidate missing phone number": async () => {
			const resume = DeepCopy(ResumeData) as any;
			delete resume.about.phoneNumber;
			assert.isFalse((await validationHandler(resume)).ok);
		},
		"should invalidate empty phone number": async () => {
			const resume = DeepCopy(ResumeData);
			resume.about.phoneNumber = "";
			assert.isFalse((await validationHandler(resume)).ok);
		},
		"should invalidate empty email": async () => {
			const resume = DeepCopy(ResumeData);
			resume.about.emailAddress = "";
			assert.isFalse((await validationHandler(resume)).ok);
		},
		"should invalidate invalid email": async () => {
			const resume = DeepCopy(ResumeData);
			resume.about.emailAddress = "ronald@mcdonalds";
			assert.isFalse((await validationHandler(resume)).ok);
		},
		"should invalidate additional property": async () => {
			const resume = DeepCopy(ResumeData);
			Object.assign(resume, { key: "value" });
			assert.isFalse((await validationHandler(resume)).ok);
		},
		"should validate full object": async () => {
			const resume = DeepCopy(ResumeData);
			assert.isTrue((await validationHandler(resume)).ok);
		},
	} satisfies ITestData;
};
