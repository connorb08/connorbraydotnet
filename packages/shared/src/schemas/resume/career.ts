import type { JSONSchemaType } from "ajv";
import type { ExperienceItem } from "#types";

export const ResumeCareerSchema: JSONSchemaType<ExperienceItem[]> = {
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
