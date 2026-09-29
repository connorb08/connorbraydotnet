import type { Resume } from "./index";

export const EmptyResume = {
	about: {
		name: "",
		phoneNumber: "",
		emailAddress: "",
		location: "",
	},
	options: {
		order: [],
	},
	skills: [],
	sections: [],
} satisfies Resume;

export const ExampleResume = {
	about: {
		name: "Ronald McDonald",
		phoneNumber: "(555) 555-5555",
		emailAddress: "ronald@mcdonalds.com",
		location: "San Bernardino, California",
	},
	options: {
		order: ["Experience", "Education", "Projects"],
	},
	skills: [
		{
			skillName: "Soft Skills",
			skillList: ["Customer Service", "Management", "Teamwork"],
		},
		{
			skillName: "Fried Foods",
			skillList: ["Frying", "Breading", "Oil Management"],
		},
	],
	sections: [
		{
			title: "Experience",
			items: [
				{
					company: "McDonald's",
					title: "Burger Clown",
					startDate: "2015-01-01",
					endDate: undefined,
					about: [
						"Managed daily operations of the restaurant, including staff supervision, customer service, and inventory management.",
					],
				},
				{
					company: "McDonald's",
					title: "Restaurant Manager",
					startDate: "2015-01-01",
					endDate: "2020-12-31",
					about: [
						"Managed daily operations of the restaurant, including staff supervision, customer service, and inventory management.",
					],
				},
				{
					company: "McDonald's",
					title: "Shift Supervisor",
					startDate: "2010-01-01",
					endDate: "2014-12-31",
					about: [
						"Supervised shifts, ensuring smooth operations and excellent customer service.",
					],
				},
			],
		},
		{
			title: "Education",
			items: [
				{
					school: "Clown College",
					degree: "B.S. in Clowning",
					startDate: "2006-09-01",
					endDate: "2010-06-30",
					about: [
						"Completed clown college education with a focus on performance and entertainment.",
					],
				},
			],
		},
		{
			title: "Projects",
			items: [
				{
					name: "Ronald McDonald House",
					description: "Charity project supporting families with sick children.",
					about: [
						"Led the redesign of the McDonald's website, improving user experience and accessibility.",
					],
				},
			],
		},
	],
} satisfies Resume;
