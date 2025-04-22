import type { JSONSchemaType } from "ajv";

export interface ICareerData {
	company: string;
	title: string;
	location: string;
	startDate: string;
	about: string[];
	endDate?: string;
}

export const CareerSchema: JSONSchemaType<ICareerData[]> = {
	type: "array",
	items: {
		type: "object",
		required: ["company", "title", "location", "startDate", "about"],
		properties: {
			company: { type: "string" },
			title: { type: "string" },
			location: { type: "string" },
			startDate: { type: "string" },
			about: {
				type: "array",
				items: { type: "string" },
			},
			endDate: { type: "string", nullable: true },
		},
	},
};
