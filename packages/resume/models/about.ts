import type { JSONSchemaType } from "ajv";

export interface IAboutMeData {
	phoneNumber: string;
	emailAddress: string;
	location: string;
	languages: string[];
	technologies: string[];
	interests?: string[];
}

export const AboutMeSchema: JSONSchemaType<IAboutMeData> = {
	type: "object",
	properties: {
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
