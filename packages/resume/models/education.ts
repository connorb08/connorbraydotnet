import type { JSONSchemaType } from "ajv";

export interface IEducationData {
	school: string;
	degree: string;
	about: string[];
	location?: string;
	startDate?: string;
	endDate?: string;
}

export const EducationSchema: JSONSchemaType<IEducationData[]> = {
	type: "array",
	items: {
		type: "object",
		required: ["school", "degree", "about"],
		properties: {
			school: { type: "string" },
			degree: { type: "string" },
			location: { type: "string", nullable: true },
			startDate: { type: "string", nullable: true },
			endDate: { type: "string", nullable: true },
			about: {
				type: "array",
				items: { type: "string" },
			},
		},
	},
};
