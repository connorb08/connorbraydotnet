import type { JSONSchemaType } from "ajv";

export interface Project {
	name: string;
	technologies: string[];
	about: string[];
}

export const ProjectSchema: JSONSchemaType<Project[]> = {
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
