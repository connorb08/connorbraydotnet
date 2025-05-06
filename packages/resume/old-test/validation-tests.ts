/** biome-ignore-all lint/suspicious/noExplicitAny: allow using any */

import type { TestFunction } from "vitest";
import type { IResumeData } from "#models";
import type { ResumeValidationHandler } from "#validate";
import { DeepCopy } from "./utils";

export const ValidResume: IResumeData = {
	name: "Ronald McDonald",
	about: {
		phoneNumber: "(555) 555-5555",
		emailAddress: "ronald@mcdonalds.com",
		location: "Orlando, FL",
		languages: ["C#", "TypeScript", "Python", "SQL", "C"],
		technologies: ["Flat top", "Ice Cream Machine"],
		interests: ["Chicken Nuggets", "Big Macs", "Software Infrastructure"],
	},
	career: [
		{
			company: "McDonalds",
			title: "Fry Cook",
			location: "Orlando, FL",
			startDate: "Feb 2000",
			endDate: "Oct 2000",
			about: [],
		},
		{
			company: "McDonalds",
			title: "Assistant to the Regional Manager",
			location: "Orlando, FL",
			startDate: "Oct 2000",
			endDate: "Jan 2001",
			about: [],
		},
		{
			company: "McDonalds",
			title: "Burger Clown",
			location: "Remote",
			startDate: "Jan 2001",
			about: [],
		},
	],
	education: [
		{
			school: "Joke of a School",
			location: "Miami, FL",
			degree: "B.S. Hamburger Design",
			endDate: "January 2000",
			about: ["Bullet 1", "Bullet 2", "Bullet 3"],
		},
	],
	projects: [
		{
			name: "McDonalds Website",
			about: [
				"Built a website for McDonalds using HTML, CSS, and JavaScript.",
				"Used React to build the front end.",
				"Used Node.js to build the back end.",
			],
			technologies: ["React", "Node.js"],
		},
	],
};

interface ITestData {
	[TestDescription: string]: TestFunction<object>;
}

export const ValidateTestData = (
	validationHandler: ResumeValidationHandler,
) => {
	return {
		"should invalidate empty object": async () => {
			const resume = {};
			const result = await validationHandler(resume);
			assert.isFalse(result.ok);
			assert.isString(result.error, "Error should be a string");
			expect(result.error).toContain("must have required property");
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
			const resume = DeepCopy(ValidResume) as any;
			delete resume.about.phoneNumber;
			assert.isFalse((await validationHandler(resume)).ok);
		},
		"should invalidate empty phone number": async () => {
			const resume = DeepCopy(ValidResume);
			resume.about.phoneNumber = "";
			assert.isFalse((await validationHandler(resume)).ok);
		},
		"should invalidate empty email": async () => {
			const resume = DeepCopy(ValidResume);
			resume.about.emailAddress = "";
			assert.isFalse((await validationHandler(resume)).ok);
		},
		"should invalidate invalid email": async () => {
			const resume = DeepCopy(ValidResume);
			resume.about.emailAddress = "ronald@mcdonalds";
			assert.isFalse((await validationHandler(resume)).ok);
		},
		"should invalidate additional property": async () => {
			const resume = DeepCopy(ValidResume);
			Object.assign(resume, { key: "value" });
			assert.isFalse((await validationHandler(resume)).ok);
		},
		"should validate full object": async () => {
			const resume = DeepCopy(ValidResume);
			assert.isTrue((await validationHandler(resume)).ok);
		},
	} satisfies ITestData;
};
