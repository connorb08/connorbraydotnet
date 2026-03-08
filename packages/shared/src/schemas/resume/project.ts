import type { JSONSchemaType } from "ajv";
import type { ProjectItem } from "#types";

export const ResumeProjectSchema: JSONSchemaType<ProjectItem[]> = {
	type: "array",
	items: {
		type: "object",
		required: ["name", "about"],
		properties: {
			name: { type: "string" },
			description: { type: "string" },
			about: {
				type: "array",
				items: { type: "string" },
			},
		},
	},
};
