import type { JSONSchemaType } from "ajv";
import type { Resume } from "#types";
import { ResumeAboutSchema } from "./about";
import { ResumeCareerSchema } from "./career";
import { ResumeEducationSchema } from "./education";
import { ResumeProjectSchema } from "./project";

const ResumeSchema: JSONSchemaType<Resume> = {
	$id: "Resume",
	type: "object",
	properties: {
		name: { type: "string" },
		about: ResumeAboutSchema,
		education: ResumeEducationSchema,
		career: ResumeCareerSchema,
		projects: ResumeProjectSchema,
	},
	required: ["name", "about", "education", "career", "projects"],
	additionalProperties: false,
};

export { ResumeSchema };
