import type { JSONSchemaType } from "ajv";
import type { ResumeSection } from "#types";

const EducationItemSchema = {
	type: "object",
	properties: {
		school: { type: "string" },
		degree: { type: "string" },
		about: { type: "array", items: { type: "string" } },
		location: { type: "string" },
		startDate: { type: "string" },
		endDate: { type: "string" },
	},
	required: ["school", "degree", "about"],
	additionalProperties: false,
} as const;

const ExperienceItemSchema = {
	type: "object",
	properties: {
		company: { type: "string" },
		title: { type: "string" },
		location: { type: "string" },
		startDate: { type: "string" },
		about: { type: "array", items: { type: "string" } },
		endDate: { type: "string" },
	},
	required: ["company", "title", "location", "startDate", "about"],
	additionalProperties: false,
} as const;

const ProjectItemSchema = {
	type: "object",
	properties: {
		name: { type: "string" },
		description: { type: "string" },
		about: { type: "array", items: { type: "string" } },
	},
	required: ["name", "about"],
	additionalProperties: false,
} as const;

const BoardPositionItemSchema = {
	type: "object",
	properties: {
		name: { type: "string" },
		role: { type: "string" },
		location: { type: "string" },
		startDate: { type: "string" },
		endDate: { type: "string" },
		about: { type: "array", items: { type: "string" } },
	},
	required: ["name", "role", "about"],
	additionalProperties: false,
} as const;

export const ResumeSectionSchema = {
	type: "object",
	properties: {
		title: { type: "string" },
		items: {
			type: "array",
			items: {
				oneOf: [
					EducationItemSchema,
					ExperienceItemSchema,
					ProjectItemSchema,
					BoardPositionItemSchema,
				],
			},
		},
	},
	required: ["title", "items"],
	additionalProperties: false,
} as unknown as JSONSchemaType<ResumeSection>;
