import type { JSONSchemaType } from "ajv";
import type { ResumeProject } from "#types";

export const ResumeProjectSchema: JSONSchemaType<ResumeProject[]> = {
	type: "array",
	items: {
		type: "object",
		required: ["name", "about"],
		properties: {
			name: { type: "string" },
			technologies: {
				type: "array",
				items: { type: "string" },
			},
			about: {
				type: "array",
				items: { type: "string" },
			},
		},
	},
};
