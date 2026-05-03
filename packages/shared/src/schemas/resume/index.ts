// import type { JSONSchemaType } from "ajv";
// import type { Resume } from "schemas";
// import { ResumeSections } from "#types";
// import { ResumeAboutSchema } from "./about";
// import { ResumeSectionSchema } from "./section";
// import { ResumeSkillsSchema } from "./skills";

// const ResumeSchema: JSONSchemaType<Resume> = {
// 	$id: "Resume",
// 	type: "object",
// 	properties: {
// 		about: ResumeAboutSchema,
// 		skills: ResumeSkillsSchema,
// 		summary: { type: "string", nullable: true },
// 		sections: {
// 			type: "array",
// 			items: ResumeSectionSchema,
// 		},
// 		order: {
// 			type: "array",
// 			items: {
// 				type: "string",
// 				enum: Object.values(ResumeSections),
// 			},
// 		},
// 	},
// 	required: ["about", "skills", "sections", "order"],
// 	additionalProperties: false,
// };

// export { ResumeSchema };

export {};
