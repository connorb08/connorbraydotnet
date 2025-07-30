import type { JSONSchemaType } from "ajv";
import type { ResumeEducation } from "~/types";

export const ResumeEducationSchema: JSONSchemaType<ResumeEducation[]> = {
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
