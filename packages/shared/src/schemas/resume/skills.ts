import type { JSONSchemaType } from "ajv";
import type { ResumeSkills } from "#types";

export const ResumeSkillsSchema: JSONSchemaType<ResumeSkills> = {
	type: "object",
	properties: {
		languages: {
			type: "array",
			items: { type: "string" },
		},
		technologies: {
			type: "array",
			items: { type: "string" },
		},
		interests: {
			type: "array",
			items: { type: "string" },
		},
	},
	required: ["languages", "technologies", "interests"],
	additionalProperties: false,
};
