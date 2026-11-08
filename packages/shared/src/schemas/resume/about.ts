import type { ResumeAbout } from "#types";
import type { JSONSchemaType } from "ajv";

export const ResumeAboutSchema: JSONSchemaType<ResumeAbout> = {
	type: "object",
	properties: {
		name: { type: "string" },
		phoneNumber: { type: "string", isNotEmpty: true },
		emailAddress: { type: "string", format: "email" },
		location: { type: "string" },
		summary: { type: "string", nullable: true },
	},
	required: ["name", "phoneNumber", "emailAddress", "location"],
	additionalProperties: false,
};
