import type { Resume } from "#types";
import { DeepCopy } from "#utils";

export const ResumeData: Resume = {
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
			about: ["Scare children with my clown costume"],
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
			description: "A website for McDonalds",
			about: [
				"Built a website for McDonalds using HTML, CSS, and JavaScript.",
				"Used React to build the front end.",
				"Used Node.js to build the back end.",
			],
		},
	],
};

export const EmptyResume: Resume = {
	name: "",
	about: {
		phoneNumber: "",
		emailAddress: "",
		location: "",
		languages: [],
		technologies: [],
		interests: [],
	},
	career: [],
	education: [],
	projects: [],
};

export const ValidResume = () => {
    return DeepCopy<Resume>(ResumeData);
};