import type { JSONSchemaType } from "ajv";

export interface Project {
	name: string;
	about: string[];
}

export const ProjectSchema: JSONSchemaType<Project[]> = {
	type: "array",
	items: {
		type: "object",
		required: ["name", "about"],
		properties: {
			name: { type: "string" },
			about: {
				type: "array",
				items: { type: "string" },
			},
		},
	},
};
