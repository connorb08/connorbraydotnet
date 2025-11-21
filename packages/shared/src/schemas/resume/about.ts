import type { JSONSchemaType } from "ajv";
import type { ResumeAbout } from "#types";

export const ResumeAboutSchema: JSONSchemaType<ResumeAbout> = {
	type: "object",
	properties: {
		summary: { type: "string", nullable: true },
		phoneNumber: { type: "string", isNotEmpty: true },
		emailAddress: { type: "string", format: "email" },
		location: { type: "string" },
		languages: {
			type: "array",
			items: {
				type: "string",
			},
		},
		technologies: {
			type: "array",
			items: {
				type: "string",
			},
		},
		interests: {
			type: "array",
			nullable: true,
			items: {
				type: "string",
			},
		},
	},
	required: ["phoneNumber", "emailAddress", "location"],
	additionalProperties: false,
};
